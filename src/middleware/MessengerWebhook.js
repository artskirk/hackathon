require('dotenv').config({ path: '../../.env' });
const { TELEGRAM_API_URL, CLIENT_TOKEN, OAI_MODEL_GPT_DEFAULT, OAI_GPT4 } = process.env
const { logger } = require('../Logger')
const { processMessage } = require('../dialog/ProcessMessage')
const { notification } = require('../dialog/Notification')
const { button } = require('../asset/button.js')
const { logUserHistory } = require('../dialog/history/Logger')
const { pingUser, sendButton, sendVideo, sendVoice, sendImage } = require('../dialog/PingUser')
const { createUserFromMessage, set } = require('../db/User')
const { callbackQueryProcessor } = require('../processor/CallbackQueryProcessor')
const { getCompletionFromAI } = require('../openai/models/Gpt')
const { queue } = require('../db/Queue')
const { cache } = require('../db/Cache')
const { userLanguage } = require('../helper/UserLanguageHelper')
const { userActivity } = require('../helper/UserActivityHelper')
const { format } = require('../helper/FormatMessageHelper')
const { tokenManagement } = require('../helper/TokenManagementHelper')
const { trello } = require('../integration/trello/Service')
const { textToVoice, listVoices, getVoiceFromTheList } = require('../google/TextToVoice')
const User = require('../models/User')
const axios = require('axios')
const CLIENT_API = TELEGRAM_API_URL + CLIENT_TOKEN;

const getTrialSubscriptionExceededNotification = (userInfo) => {
    return notification.getTrialSubscriptionExceededNotification(userInfo.user, userInfo.user.paymentLink)
}

const getInputTokenLimitExceededNotification = (userInfo) => {
    let notificationText;
    if (userInfo.user.isLastPaymentSuccessfull) {
        notificationText = notification.getInputTokenLimitExceededNotificationSubscribed(userInfo.user)
    } else {
        notificationText = notification.getInputTokenLimitExceededNotificationUnSubscribed(userInfo.user, userInfo.user.paymentLink)
    }
    return notificationText;
}

const getHoldOnNotification = (userInfo) => {
    return notification.getHoldOnNotification(userInfo.user, format.getRandomNumber())
}

const isInputTokenLimitExceeded = (userInfo, message) => {
    if (!message?.text?.length) {
        return false;
    }
    if (userInfo.user.isLastPaymentSuccessfull) {
        return tokenManagement.isTokenLimitExceededForSubscribedUser(message.text);
    }
    return tokenManagement.isTokenLimitExceededForUnsubscribedUser(message.text);
}

module.exports = async (req, res, next) => {

    try {

        const message = req.body.message || req.body.edited_message || req.body.callback_query.message;
        const chatId = message.chat.id;
        const userResponse = await createUserFromMessage(message);
        const callbackQuery = req.body.callback_query ?? false;

        logger.log({ level: 'info', message: userResponse });

        await pingUser(chatId)

        // Add last message from user to cache
        cache.cacheMessage({
            userId: userResponse.user._id,
            messageId: message?.message_id,
            messageText: message.text,
        });

        // Initialize queue
        const queueUser = {
            userId: userResponse.user._id,
            messageId: message?.message_id
        };

        let text;
        if (await queue.existsNotResolved(queueUser)) {
            text = getHoldOnNotification(userResponse);
        } else {
            await queue.createOrUpdateQueue(queueUser);
        }

        if (userResponse.limitExceeded) {
            text = getTrialSubscriptionExceededNotification(userResponse);
        } else if (userActivity.detectRepeatMessgeRequest(message.text)) {
            try {
                const messageFromCacheText = await cache.getMessageFromCache(userResponse.user._id)
                const messageFromCacheOb = { ...message, text: messageFromCacheText }
                await pingUser(chatId, messageFromCacheText)
                await pingUser(chatId)
                text = await processMessage(messageFromCacheOb, userResponse.user)

                logger.log({
                    level: 'info',
                    message: `Repeat request was detected. Message from cache: ${messageFromCacheOb.text}`
                });
            } catch (error) {
                logger.log({
                    level: 'error', message: {
                        title: 'Getting message from cache error',
                        error: error
                    }
                });
            }
        } else if (userActivity.detectVoiceRequest(message.text)) {
            logger.log({
                level: 'info',
                message: `Voice request is detected. UserID: ${userResponse.user._id}`
            });
            // Cancel and reset the settings
            await set(
                userResponse.user,
                {
                    voiceAnnouncer: User.voiceAnnouncer,
                    awaitUserInput: User.awaitUserInput,
                    voiceModeEnabled: User.voiceModeEnabled,
                    voiceSpeakingRate: User.voiceSpeakingRate,
                    voicePitch: User.voicePitch,
                    voiceSSMLContent: User.voiceSSMLContent,
                    useSSML: User.useSSML,
                    voiceContent: User.voiceContent,
                    awaitVoiceSpeakingRateInput: User.awaitVoiceSpeakingRateInput,
                    awaitVoicePitchInput: User.awaitVoicePitchInput,
                    awaitUserInput: User.awaitUserInput,
                }
            )
            await sendVideo(chatId, notification.getVoiceIntroduceNotification(userResponse.user), 'voice-promo')
            await sendButton(chatId, button.voice.message, button.voice.tree)
        } else if (userActivity.detectIntegrationRequest(message.text)) {
            try {
                if (!userResponse.user.isUserActivated) {
                    text = notification.getAccessDeniedNotification(userResponse.user)
                } else {
                    // Intro
                    await pingUser(chatId, notification.getIntegerationRequestNotification(userResponse.user))
                    await sendVideo(chatId, notification.getIntegrationIntroduceNotification(userResponse.user), 'integration-promo')
                }
            } catch (error) {
                text = notification.getOopsNotification(userResponse.user)
                logger.log({
                    level: 'error',
                    message: `The /integration command down with failure. User: ${userResponse.user._id}. Details: ${error.message}. Stack: ${error.stack}`
                });
            }
        } else if (userActivity.detectSearchNewTicketRequest(message.text)) {
            try {
                if (!userResponse.user.isUserActivated) {
                    text = notification.getAccessDeniedNotification(userResponse.user)
                } else {
                    // Disable ticket create mode, support mode. Enable Search mode
                    await set(userResponse.user, {
                        ticketCreateModeEnabled: User.ticketCreateModeEnabled,
                        ticketTroubleshootModeEnabled: User.ticketTroubleshootModeEnabled,
                        ticketSearchModeEnabled: User.ticketSearchModeEnabled
                    })
                    // Search for new tickets
                    const searchNewTicketResponse = await trello.searchNewTickets()
                    if (searchNewTicketResponse?.length) {
                        const tickets = searchNewTicketResponse.map(ticket => `${ticket?.name}: ${ticket?.shortUrl}`).join('\n')
                        // Shere results to the user
                        await pingUser(chatId, notification.getFoundNewTicketNotification(userResponse.user, tickets))
                        // Ask to proceed and classify the tickets with AI or exit
                        await sendButton(chatId, button.classifyNewTicketAction.message, button.classifyNewTicketAction.tree)
                    } else {
                        await pingUser(chatId, notification.getNoTicketFoundNotification(userResponse.user))
                    }
                }
            } catch (error) {
                text = notification.getOopsNotification(userResponse.user)
                logger.log({
                    level: 'error',
                    message: `Ticket Search Integration down with failure. Details: ${error.message}`
                });
            }
        } else if (userActivity.detectCreateTicketRequest(message.text)) {
            if (!userResponse.user.isUserActivated) {
                text = notification.getAccessDeniedNotification(userResponse.user)
            } else {
                try {
                    logger.log({
                        level: 'info',
                        message: `Create new ticket request is detected. UserID: ${userResponse.user._id}`
                    });
                    sendButton(chatId, button.createTicket.message, button.createTicket.tree)
                } catch (error) {
                    text = notification.getOopsNotification(userResponse.user)
                    logger.log({
                        level: 'error',
                        message: `Create ticket Integration down with failure. User: ${userResponse.user._id}. Details: ${error.message}. Stack: ${error.stack}`
                    });
                }
            }
        } else if (userActivity.detectAIModelRequest(message.text)) {
            logger.log({
                level: 'info',
                message: `AI command is detected. UserID: ${userResponse.user._id}`
            });

            sendButton(chatId, button.ai.message, button.ai.tree)

        } else if (userActivity.detectSelectLanguageRequest(message.text)) {
            logger.log({
                level: 'info',
                message: `Select language command is detected. UserID: ${userResponse.user._id}`
            });

            sendButton(chatId, button.language.message, button.language.tree)

        } else if (userActivity.detectTranslationRequest(message.text)) {
            logger.log({
                level: 'info',
                message: `Translation command is detected. UserID: ${userResponse.user._id}`
            });

            sendButton(chatId, button.translate.message, button.translate.tree)

        } else if (userActivity.detectActAsRequest(message.text)) {
            logger.log({
                level: 'info',
                message: `Act command is detected. UserID: ${userResponse.user._id}. \
                Current AI role: ${userResponse.user.actAs}, default role: ${User.actAs}.`
            });

            try {
                let tree = userActivity.markCurrentInMap(button.act.tree, userResponse.user.actAs, User.actAs)
                sendButton(chatId, button.act.message, tree)
            } catch (error) {
                logger.log({
                    level: 'error', message: {
                        title: `Unable to set current by optionId. OptionId: ${userResponse.user.actAs}. Default: ${User.actAs}`,
                        error: error
                    }
                });
            }

        } else if (userActivity.detectInfoRequst(message.text)) {
            text = notification.getSubscriptionInfoNotification(userResponse.user)
        } else if (userActivity.detectStartRequest(message.text)) {
            try {
                if (!userResponse.user?.requestedUserName) {
                    // Ask to provide user name
                    text = notification.getRequestForUserNameNotification(userResponse.user)
                    // Enable provide user name mode
                    await set(userResponse.user, {
                        requestedUserNameModeEnabled: true
                    })
                } else {
                    // Disable provide user name mode
                    await set(userResponse.user, {
                        requestedUserNameModeEnabled: User.requestedUserNameModeEnabled
                    })

                    // Send Start Notification
                    await pingUser(chatId, notification.getStartNotification(userResponse.user))
                    // Send the video tips
                    await sendVideo(chatId, notification.getVoiceTipNotification(userResponse.user), 'tip-6')
                    await sendVideo(chatId, notification.getActTipNotification(userResponse.user), 'tip-1')
                    await sendVideo(chatId, notification.getImgTipNotification(userResponse.user), 'tip-2')
                    await sendVideo(chatId, notification.getTrTipNotification(userResponse.user), 'tip-3')
                    await sendVideo(chatId, notification.getResetTipNotification(userResponse.user), 'tip-4')
                    await sendVideo(chatId, notification.getAiTipNotification(userResponse.user), 'tip-5')

                    // List of available commands
                    await pingUser(chatId, notification.getHelpRequestNotification(userResponse.user))
                }
            } catch (error) {
                text = notification.getOopsNotification(userResponse.user)
                logger.log({
                    level: 'error',
                    message: `The /start command down with failure. User: ${userResponse.user._id}. Details: ${error.message}. Stack: ${error.stack}`
                });
            }
        } else if (userResponse.user?.requestedUserNameModeEnabled) {
            try {
                const extractUserNamePrompt = notification.getExtractUserNameFromUserInputPrompt(userResponse.user, message.text)
                const extractUserNameResponse = await getCompletionFromAI(extractUserNamePrompt, userResponse.user)
                let notDetected = 'undetected'
                if (extractUserNameResponse == notDetected) {
                    await pingUser(chatId, notification.getUserNameIsNotRecognizedNotification(userResponse.user))
                } else {
                    // Save user name, Disable provide user name mode and ping user
                    await set(userResponse.user, {
                        requestedUserNameModeEnabled: User.requestedUserNameModeEnabled,
                        requestedUserName: extractUserNameResponse
                    })

                    // Send Start Notification
                    await pingUser(chatId, notification.getStartNotification(userResponse.user))
                    // Send the video tips
                    await sendVideo(chatId, notification.getVoiceTipNotification(userResponse.user), 'tip-6')
                    await sendVideo(chatId, notification.getActTipNotification(userResponse.user), 'tip-1')
                    await sendVideo(chatId, notification.getImgTipNotification(userResponse.user), 'tip-2')
                    await sendVideo(chatId, notification.getTrTipNotification(userResponse.user), 'tip-3')
                    await sendVideo(chatId, notification.getResetTipNotification(userResponse.user), 'tip-4')
                    await sendVideo(chatId, notification.getAiTipNotification(userResponse.user), 'tip-5')

                    // List of available commands
                    await pingUser(chatId, notification.getHelpRequestNotification(userResponse.user))

                    // Nice to meet notification...
                    const userMessage = notification.getUserNameIsRecognizedNotification(userResponse.user, extractUserNameResponse)
                    await pingUser(chatId, userMessage)

                    // Voice configuration ...
                    const voiceId = 'en-US-Wavenet-F'
                    const voice = await getVoiceFromTheList(voiceId)
                    const currentTime = new Date();
                    const timeEpoch = currentTime.getTime();
                    const voiceFilename = `${userResponse.user._id}-${timeEpoch}.mp3`
                    const voiceInputConfig = {
                        text: userMessage
                    }
                    const voiceConfig = {
                        languageCode: voice.languageCodes?.[0],
                        name: voiceId,
                        ssmlGender: voice.ssmlGender
                    }
                    const audioConfig = {
                        speakingRate: 1,
                        pitch: 1
                    }
                    await textToVoice(voiceConfig, voiceInputConfig, voiceFilename, audioConfig)
                    await sendVoice(chatId, `Hey, ${extractUserNameResponse} 🙂`, voiceFilename)
                }
            } catch (error) {
                text = notification.getOopsNotification(userResponse.user)
                logger.log({
                    level: 'error',
                    message: `Extaract user name failure. User: ${userResponse.user._id}. Details: ${error.message}. Stack: ${error.stack}`
                });
            }
        } else if (userActivity.detectImageNoDescriptionRequest(message.text)) {
            text = notification.getGenerateImgNoDescriptionNotification(userResponse.user)
        } else if (userActivity.detectHelpRequest(message.text)) {
            text = notification.getHelpRequestNotification(userResponse.user)
        } else if (userActivity.detectResetRequest(message.text)) {
            sendButton(chatId, button.reset.message, button.reset.tree)
        } else if (userActivity.detectAskRandRequest(message.text)) {
            const messageOb = { ...message, text: notification.getAskRandText(userResponse.user) }
            await pingUser(chatId)
            text = await processMessage(messageOb, userResponse.user)
            text = notification.getAskRandAfterText(userResponse.user, text)
        } else if (userActivity.detectPremiumSubscriptionInfoRequest(message.text)) {
            sendButton(
                chatId,
                `${notification.getPremiumSubscriptionInfoNotification(userResponse.user)}\r\n${button.premiumSubscription.message}`,
                button.premiumSubscription.tree
            )
        } else if (callbackQuery) {
            logger.log({
                level: 'info',
                message: { description: `Callback query request is detected.`, callback_query: callbackQuery }
            });
            callbackQueryProcessor.process(callbackQuery, chatId, userResponse.user);

        } else if (userActivity.detectActivationRequest(message.text) || userResponse.user.activationModeEnabled) {
            try {
                if (userResponse.user.isUserActivated) {
                    // User is already activated
                    await pingUser(chatId, notification.getUserAlreadyActivatedNotification(userResponse.user))
                    // Disable activation mode
                    await set(userResponse.user, {
                        activationModeEnabled: User.activationModeEnabled
                    })
                } else if (userResponse.user.activationModeEnabled && userActivity.isActivationCodeValid(message.text)) {
                    // Disable activation mode and activate user with premium subscription
                    await set(userResponse.user, {
                        activationModeEnabled: User.activationModeEnabled,
                        availableCredits: User.availableCredits,
                        isUserActivated: true,
                        isLastPaymentSuccessfull: true
                    })
                    // Congrats
                    await pingUser(chatId, notification.getUserActivatedSuccessfulNotification(userResponse.user))
                } else if (userResponse.user.activationModeEnabled && !userActivity.isActivationCodeValid(message.text)) {
                    // Activation code is not valid, please try again
                    await pingUser(chatId, notification.getActivationCodeInvalidNotification(userResponse.user))
                } else {
                    // Enable activation mode and ask to enter activation code
                    await set(userResponse.user, {
                        activationModeEnabled: true
                    })
                    await pingUser(chatId, notification.getActivationCodeRequestNotification(userResponse.user))
                }
            } catch (error) {
                text = notification.getOopsNotification(userResponse.user)
                logger.log({
                    level: 'error',
                    message: `Activation process down with failure. User: ${userResponse.user._id}. Details: ${error.message}. Stack: ${error.stack}`
                });
            }
        } else if (userResponse.user.ticketTroubleshootModeEnabled) {
            try {
                // Verify user input
                if (message.text.length < 200) {
                    await pingUser(chatId, notification.getIssueVerificationFailsNotification(userResponse.user))
                } else {
                    const verifyIssuePrompt = notification.getVerifyIssuePrompt(userResponse.user, message.text)
                    // Ping user to await
                    await pingUser(chatId, notification.getAwaitNotification(userResponse.user))
                    const verifyIssueResponse = await getCompletionFromAI(verifyIssuePrompt, userResponse.user)
                    const debugTicketResponse = await trello.createNewTicket(
                        `Issue troubleshhot: ${userResponse.user._id}`,
                        verifyIssueResponse,
                        trello.debugListId
                    )

                    const ticketContentMessge = notification.getHaveCreateTroubleshootResponseNotification(
                        userResponse.user,
                        debugTicketResponse?.shortUrl
                    )

                    await pingUser(chatId, ticketContentMessge)

                    logger.log({
                        level: 'info',
                        message: {
                            title: `Issue troubleshoot is successfull. User: ${userResponse.user._id}`,
                            content: debugTicketResponse?.shortUrl
                        }
                    })

                    // Disable ticket troubleshoot mode
                    await set(userResponse.user, {
                        ticketTroubleshootModeEnabled: User.ticketTroubleshootModeEnabled
                    })

                    //Send buttons
                    await sendButton(chatId, button.issueTroubleshootAfter.message, button.issueTroubleshootAfter.tree)
                }
            } catch (error) {
                text = notification.getOopsNotification(userResponse.user)
                logger.log({
                    level: 'error',
                    message: `Ticket Create Troubleshhot integration down with failure. User: ${userResponse.user._id}. Details: ${error.message}. Stack: ${error.stack}`
                });
            }
        } else if (userResponse.user.ticketCreateModeEnabled) {
            try {
                // Verify user input
                if (message.text.length < 200) {
                    await pingUser(chatId, notification.getTicketVerificationFailsNotification(userResponse.user))
                } else {
                    const jiraTicketJSONPrompt = notification.getCreateTicketJSONPrompt(userResponse.user, message.text)
                    const jiraContentPrompt = notification.getCreateTicketContentPrompt(userResponse.user, message.text)

                    // Ping user to await
                    await pingUser(chatId, notification.getAwaitNotification(userResponse.user))
                    const jiraTicketContentResponse = await getCompletionFromAI(jiraContentPrompt, userResponse.user)

                    // Notify user that we're still working
                    await pingUser(chatId, notification.getStillWorkingOnItNotification(userResponse.user))
                    const jiraTicketJSON = await getCompletionFromAI(jiraTicketJSONPrompt, userResponse.user)
                    const ticket = JSON.parse(jiraTicketJSON)

                    logger.log({
                        level: 'info',
                        message: {
                            title: `Jira ticket content is successfully received`,
                            body: ticket
                        }
                    })

                    // Notify user finally
                    await pingUser(chatId, notification.getAlmostThereNotification(userResponse.user))

                    // Create new support ticket
                    const supportTicketResponse = await trello.createNewTicket(ticket?.title, message.text)
                    const aiBacklogTicketResponse = await trello.createNewAIBacklogTicket(ticket?.title, jiraTicketContentResponse)
                    const assignTicketResponse = await trello.assignTicketToSpecificTeam(ticket?.title, jiraTicketContentResponse, ticket?.issue_type)
                    const ticketContentMessge = notification.getHaveCreatedNewTicketNotification(
                        userResponse.user,
                        supportTicketResponse?.shortUrl,
                        aiBacklogTicketResponse?.shortUrl,
                        ticket?.issue_type,
                        assignTicketResponse?.shortUrl
                    )

                    // Share created tickets with the user
                    await pingUser(chatId, ticketContentMessge)

                    // Disable ticket create mode and support mode
                    await set(userResponse.user, {
                        ticketCreateModeEnabled: User.ticketCreateModeEnabled,
                        ticketTroubleshootModeEnabled: User.ticketTroubleshootModeEnabled
                    })

                    // Further actions
                    await sendButton(chatId, button.createTicketAfter.message, button.createTicketAfter.tree)
                }
            } catch (error) {
                text = notification.getOopsNotification(userResponse.user)
                logger.log({
                    level: 'error',
                    message: `Ticket Create Integration down with failure. Details: ${error.message}`
                });
            }
        } else if (userResponse.user.voiceModeEnabled && userResponse.user.awaitVoiceSpeakingRateInput) {
            if (format.validateRange(message.text, 0.25, 4)) {
                await set(userResponse.user, { voiceSpeakingRate: message.text });
                sendButton(chatId, button.voiceAwaitSpeakingRateInput.message, button.voiceAwaitSpeakingRateInput.tree)
            } else {
                await pingUser(chatId, notification.getVoiceSpeakingRateValidationFailiedNotification(userResponse.user))
            }
            logger.log({
                level: 'info',
                message: `Voice speaking rate input was received from UserID: ${userResponse.user._id}. \
                Input is: ${message.text}`
            });
        } else if (userResponse.user.voiceModeEnabled && userResponse.user.awaitVoicePitchInput) {
            if (format.validateRange(message.text, -20, 20)) {
                await set(userResponse.user, { voicePitch: message.text });
                sendButton(chatId, button.voiceAwaitPitchInput.message, button.voiceAwaitPitchInput.tree)
            } else {
                await pingUser(chatId, notification.getVoicePitchValidationFailiedNotification(userResponse.user))
            }
            logger.log({
                level: 'info',
                message: `Voice pitch input was received from UserID: ${userResponse.user._id}. \
                Input is: ${message.text}`
            });
        } else if (userResponse.user.voiceModeEnabled && userResponse.user.awaitUserInput) {
            await set(userResponse.user, { voiceContent: message.text });
            sendButton(chatId, button.voiceCreateConfirmation.message, button.voiceCreateConfirmation.tree)
            logger.log({
                level: 'info',
                message: `Voice input was successfully received from UserID: ${userResponse.user._id}. \
                Input is: ${message.text}`
            });

        } else if (userResponse?.trialLimitExceeded === true) {
            // User is already sepent all available credits for the trial period
            text = notification.getTrialSubscriptionDaylyLimitExceededNotification(userResponse.user);
        } else if (userResponse?.gpt4LimitExceeded === true) {
            // User is already sepent all available credits with GPT-4
            text = notification.getGpt4LimitExceededNotification(userResponse.user);
        } else if (isInputTokenLimitExceeded(userResponse, message)) {
            // Set IO limit before processing message
            text = getInputTokenLimitExceededNotification(userResponse);
        } else if (!text) {
            text = await processMessage(message, userResponse.user);
        }

        // Log request
        logger.log({ level: 'info', message: req.body });

        await pingUser(chatId, text)

        // Resolve queue
        await queue.createOrUpdateQueue(queueUser);

        // Log to history
        await logUserHistory({
            _id: userResponse.user._id,
            userRequest: message.text,
            userResponse: text
        });

        return res.send()

    } catch (error) {
        logger.log({
            level: 'error', message: {
                error: error,
                request_body: req.body
            }
        });
    }

    next();
}