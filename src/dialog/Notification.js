const { format } = require('../helper/FormatMessageHelper')
const { userLanguage } = require('../helper/UserLanguageHelper')
const { userActivity } = require('../helper/UserActivityHelper')
const User = require('../models/User')
const { logger } = require('../Logger');

const map = {
    'trialSubscriptionExceededNotification': {
        en: `${userActivity.getDangerIcon()} Oops, it's unfortunate! To continue our conversation, you'll need a subscription. Don't worry, it's an easy fix! \
        By signing up for our service, you'll gain access to advanced features of GrademeAI including the ability to create \
        amazing images. I'll be able to provide even more personalized and accurate results. A subscription is a quick and \
        simple way to remove restrictions and chat with me freely again. 😉  %1%`,
        ru: `Ах, как жаль! Я бы с удовольствием продолжил общение, но увы, для этого нужна подписка. Но не переживай, \
        это легко исправить! Ты легко можешь получить доступ к более продвинутым функциям GrademeAI, если подпишешься на наш сервис. \
        Ты получишь возможность создавать удивительные изображения, а я смогу стать еще более персонализированным и давать точные \
        результаты. Подписка - это быстрый и простой путь, чтобы мы могли снова общаться без ограничений. 😉  %1%`
    },
    'trialSubscriptionDaylyLimitExceededNotification': {
        ru: `${userActivity.getDangerIcon()} К сожалению, Вы израсходовали дневной лимит сообщений.
        Обновитесь до Premium ${userActivity.getStarIcon()} подписки: /premium, чтобы общаться без ограничений.
        Используйте команду: /info, чтобы узнать больше о Вашей текущей подписке.`,
        en: `I apologize for the inconvenience, but you have reached your daily limit for messages. Upgrade to a 
        Premium ${userActivity.getStarIcon()} subscription: /premium, to communicate without restrictions. 
        Use the command: /info, to learn more about your current subscription.`
    },
    'generateImgNoDescriptionNotification': {
        ru: `${userActivity.getHintIcon()} Пожалуйста добавьте описание, напиример: /img Tesla Model T`,
        en: `${userActivity.getHintIcon()} Please, specify some description. For example: /img Tesla Model T`
    },
    'helpNotification': {
        en: `
        ${userActivity.getInfoIcon()} List of commands:

/premium - Get a Premium ${userActivity.getStarIcon()} Subscription
/voice - Transform text into speech
/tr - Translation mode ${userActivity.getFlagIcon()}
/ai - Select AI model ${userActivity.getBrainIcon()}
/img [description] - Get image by description
/lang - Choose language ${userActivity.getFlagIcon()}
/repeat - Repeat previous user message
/reset - Reset current settings to default
/act - Choose AI character 👤
/info - Show subscription info
/help - Show available commands. Contact GrademeAI support service

${userActivity.getInfoIcon()} If you have any questions, please write to our technical support service at support@grademe.io.`
    },
    'inputTokenLimitExceededNotificationSubscribed': {
        en: `${userActivity.getDangerIcon()} Unfortunately, you have exceeded the maximum allowable limit for entering text. \
        Please reduce the number of characters and try again.`,
        ru: `${userActivity.getDangerIcon()} К сожалению, вы превысили максимально-допустимый лимит ввода текста. \
        Пожалуйста, уменьшите количество символов и попробуйте еще раз.`
    },
    'inputTokenLimitExceededNotificationUnSubscribed': {
        en: `${userActivity.getDangerIcon()} Sorry about that! It seems like you've exceeded the maximum limit for text input. \
        But no need to worry, because I have a solution! Just subscribe to me and we can continue our \
        conversation without any restrictions. 😉 %1%`,
        ru: `${userActivity.getDangerIcon()} Упс.. был превышен максимально-допустимый лимит ввода текста. \ Но не переживай, \
        это легко исправить! Подпишись на меня и мы сможем общаться без ограничений. 😉 %1%`
    },
    'holdOnNotification': {
        en: `${userActivity.getTimeoutIcon()} I need a little time, about %1% minutes, to prepare a quality \
        answer for you. Thank you for your patience! ✌️`,
        ru: `${userActivity.getTimeoutIcon()} Мне нужно немного времени, около %1% минут, чтобы подготовить \
        для тебя качественный ответ. Спасибо за терпение! ✌️`
    },
    'actAsNotification': {
        en: `Answer like a %1%.`,
        ru: `Отвечай как %1%.`
    },
    'freeSubscriptionNotification': {
        en: `
        ${userActivity.getInfoIcon()} Your current plan is "FREE." What does your current plan allow you to do?

        ☑️ Use AI model: gpt-3.5
        ☑️ Talk to AI: ${User.availableCreditsForTrialSubscription} messages per day
        ☑️ Generate Images: type: /img
        ☑️ Input limit: 20 words per message

        Personal info:

        📌 Massages left for today: %1%/${User.availableCreditsForTrialSubscription}
        📌 AI-Model: %2%
        📌 AI act as: %3%
        📌 Language: %4%
        `
    },
    'premiumSubscriptionNotification': {
        en: `
        ${userActivity.getStarIcon()} You have a Premium Subscription type

        💫 Massages left with GPT-4: %1%
        💫 Current AI-Model: %2%
        💫 AI act as: %3%
        💫 Translation mode: %4%
        💫 Language: %5%
        `
    },
    'premiumSubscriptionInfoNotification': {
        en: `
        What are the benefits of the Premium ${userActivity.getStarIcon()} Subscription ?

        💫 Up to 200 messages per day
        💫 Text to voice feature access: /voice
        💫 Up to 100 images per day: /img
        💫 Switching between AI models: /ai
        💫 Translation mode: /tr
        💫 5 messages per day using GPT-4        
        💫 Choose between 20 AI persons: /act
        💫 Access to the all Premium features
        💫 Personalisation
        💫 Technical support
        `
    },
    'featureLockNotification': {
        en: `
        Greetings! ${userActivity.getHelloIcon()}

Unfortunately, you do not have access to this feature without a Premium subscription. To enjoy all the possibilities of our service, we recommend you to take a look at the Premium ⭐️ subscription. You will be able to enjoy many benefits and enhanced functionality.

You can find details and terms at: /premium. If you have any questions, please write to our support team at: /help, and we will be glad to assist you.

Thank you for understanding.
        `,
        ru: `
        Приветствую! ${userActivity.getHelloIcon()}

К сожалению, у вас нет доступа к данной функции без Premium подписки. Чтобы получить все возможности нашего сервиса, рекомендую ознакомиться с подпиской Premium ⭐️. Вы сможете наслаждаться множеством преимуществ и расширенным функционалом. 

Подробности и условия вы найдете здесь: /premium. Если у вас возникнут вопросы, напишите в нашу службу поддержки /help и мы с радостью Вам поможем! 

Спасибо за понимание.
        `
    },
    'resetNotification': {
        en: `${userActivity.getInfoIcon()} Settings were reset to the default.`
    },
    'createVoiceCancelNotification': {
        en: `${userActivity.getInfoIcon()} Voice record creating was canceled.`
    },
    'createVoiceConfirmNotification': {
        en: `⏱ I need some time to prepare a voice recording for you. Please wait...`
    },
    'voiceCreatedNotification': {
        en: `Voice record is successfully created. Enjoy! 😉`
    },
    'resetCancelNotification': {
        en: `${userActivity.getInfoIcon()} Reset action was canceled.`
    },
    'sharePremiumSubscriptionLinkNotification': {
        en: `Thank you for choosing us. Please, follow this link to upgrade your subscription: %1%`
    },
    'askRandNotification': {
        en: `Writre one random question to AI`,
        ru: `Сгенерируй один случайный вопрос для ИИ`
    },
    'askRandNotificationAfterText': {
        en: `${userActivity.getDiceIcon()} Here is the question that can be asked to AI: %1%`
    },
    'startRequestNotification': {
        en: `${userActivity.getHelloIcon()} Hi! I'm GrademeAI.

You have a Free subscription plan, which provides you with access to the ${User.availableCreditsForTrialSubscription} messages per day. Need more? You can unlock all the Premium ${userActivity.getStarIcon()} features by typing: /premium. 

Use /help if you need any assistance or /info to read more about your subscription.
        
Enjoy!`
    },
    'startRequestSubscribedNotification': {
        en: `${userActivity.getHelloIcon()} Hi! I'm GrademeAI.

You have a Premium ${userActivity.getStarIcon()} subscription plan. 
Click /premium to discover the benefits of the premium subscription or /help if you need any assistance.

Enjoy your plan!`
    },
    'apiFailureToRespondNotification' : {
        en: `Sorry, we're unable to process your request. Please, try again in 1-3 minutes. Thank you for your understanding.`
    },
    'apiFailureToRespondNotificationChat' : {
        en: `😥 Apologies, but I'm currently unable to process your request due to high load. 
        Please try again in 1-3 minutes. Thank you for your understanding.`
    },
    'resetTipNotification': {
        en: `4️⃣ Repeat your request as many times as necessary to achieve the best unique result.`
    },
    'imgTipNotification': {
        en: `2️⃣ Generate amazing images on demand, just type /img and put some description of your idea.`
    },
    'actTipNotification': {
        en: `1️⃣ Switch between the wide range of AI characters. Type /act to discover.`
    },
    'voiceTipNotification': {
        en: `🆕 Go from text to speech with the cutting-edge voice feature of GrademeAI. Type /voice to discover.`
    },
    'trTipNotification': {
        en: `3️⃣ Switch between the languages and get the translate.`
    },
    'aiTipNotification': {
        en: `5️⃣ Discover all the power of the AI using /ai command. GPT-4 is a new language model exhibits much higher than human-level performance.`
    },
    'gpt4LimitExceededNotification': {
        en: `I apologize for the inconvenience, but you have reached your daily limit with the GPT-4 AI model. You will be switched to GPT-3.5 Turbo. 😥 Sorry about that!`
    },
    'voiceSpeakingRateValidationFailiedNotification': {
        en: `⚠️ Error: The speaking rate value should be within the range of \r\n [0.25 - 4.00]. Please check and try again.`
    },
    'voicePitchValidationFailiedNotification': {
        en: `⚠️ Error: The pitch value should be within the range of \r\n [-20.00 - 20.00]. Please check and try again.`
    },
    'voiceVoiceTextInputNotification': {
        en: `Ok 👌. Now, please enter the text scenario you would like to be voiced.`
    },
    'voiceEnterPitchValueNotification': {
        en: `🎤 Please enter the pitch value within the range of \r\n [ -20.00 - 20.00 ].`
    },
    'voiceEnterSpeakingRateValueNotification': {
        en: `🎤 Please enter the speaking rate value within the range of \r\n [ 0.25 - 4.00 ].`
    },
    'voiceSSMLEnableNotification': {
        en: `ℹ️ Speech Synthesis Markup Language (SSML) is enabled. Your input scenario will be automatically converted to SSML.`
    },
    'voiceSSMLDisableNotification': {
        en: `ℹ️ SSML is disabled`
    },
    'voiceIntroduceNotification': {
        en: `👋 Experience cutting-edge voice manipulation technology with our GrademeAI voice feature. Quickly convert text into enchanting speech, eliminating the need for lengthy studio sessions, and create top-notch voiceovers effortlessly. Elevate your content with GrademeAI's realistic AI voices for podcasts, videos, and presentations. Captivate your audience, leave a lasting impact, and unlock boundless opportunities.\r\n\r\nJoin us now and harness the exceptional capabilities of GrademeAI.`,
        ru: `👋 Познакомьтесь с передовой технологией модификации голоса с нашей функцией GrademeAI voice. Быстро преобразуйте текст в очаровательное звучание, избегая длительных сессий в студии, и без труда создавайте первоклассные дубляжи. Поднимайте свой контент на новый уровень с помощью реалистичных ИИ-голосов GrademeAI для подкастов, видео и презентаций. Захватите внимание своей аудитории, оставьте неизгладимое впечатление и откройте безграничные возможности.\r\n\r\nПрисоединяйтесь к нам сейчас и пользуйтесь исключительными возможностями GrademeAI.`
    },
    'voiceAnnoncerPromoEmilyNotification': {
        en: `Introducing Emily, the AI voice with a delightful soft tone that is perfect for bringing beauty, relaxation, and cosmetic services to life. With her help, you can now have a high-quality studio-level recording in just a matter of seconds. Get ready to captivate your audience with Emily's soothing voice!`
    },
    'voiceAnnoncerPromoMadisonNotification': {
        en: `Introducing Madison, the AI voice that speaks with business-like confidence. Perfect for your real estate advertising campaign or professional services - legal, consulting, and outsourcing companies. With Madison's commanding voice, your message will be heard loud and clear, leaving a lasting impression on your audience.`
    },
    'voiceAnnoncerPromoJaneNotification': {
        en: `Add a touch of enchantment to your advertisement with the captivating voice of Jane! Picture your advertisement springing to life, as Jane's soothing and immersive voice mesmerizes your audience. Let her ethereal tones elevate your brand to new heights, exuding an aura of opulence and expertise.`
    },
    'voiceAnnoncerPromoAvaNotification': {
        en: `Introducing Ava - the vibrant, energetic, and cheerful voice that will perfectly complement your eCommerce projects. With Ava, you can effortlessly obtain top-notch studio-grade recordings in a matter of seconds. Say goodbye to time-consuming voiceover arrangements, and let Ava's high-quality sound bring your content to life in no time. Upgrade your project with Ava's joyful voice today.`
    },
    'voiceAnnoncerPromoElizabethNotification': {
        en: `Introducing Elizabeth - the radiant, lively, and exuberant voice that will flawlessly represent your fashion brands. With Elizabeth, you can effortlessly attain exceptional studio-quality recordings within seconds. Bid farewell to tedious voiceover preparations and let Elizabeth's exceptional sound breathe life into your content instantly. Enhance your project with Elizabeth's delightful voice today.`
    },
    'voiceAnnoncerPromoAidenNotification': {
        en: `Introducing Aiden, the energetic and engaging voice that is perfect for narrating your business. With his assistance, you'll get a high-quality studio-grade recording within seconds. Take your project to the next level with Aiden's remarkable talent!`
    },
    'voiceAnnoncerPromoBenjaminNotification': {
        en: `Introducing Benjamin – the voice of a professional narrator, perfect for delivering news in the fields of economics, finance, and scientific presentations. With Benjamin, you'll get a high-quality studio-level recording in just seconds.`
    },
    'voiceAnnoncerPromoJacobNotification': {
        en: `Looking for the perfect voice for your video courses, audiobooks, or podcasts? Look no further than Jacob! With his expertise, you'll have access to high-quality studio-level recordings in a matter of seconds. Elevate your content with Jacob's exceptional voice talent.`
    },
    'voiceAnnoncerPromoDavidNotification': {
        en: `Introducing David. His captivating narration bring life to your vlogs and enhance your online store's product reviews. Experience the brilliance of studio-quality sound, setting your content apart from the rest. Elevate your brand with David's unmatched talent!`
    },
    'voiceAnnoncerPromoAndrewNotification': {
        en: `Elevate your content with flawless delivery and premium studio-quality sound. Captivate and convert your audience with Andrew's voice that brings life to your B2B, sales, and marketing projects.`
    },
    'voiceAnnoncerPromoValentinaNotification': {
        en: null,
        ru: `Валентина - идеальный голос для рекламы в сфере красоты. Ее мягкий обволакивающий тон идеально передаст все нюансы вашего продукта. Уверенный звук студийного качества - с ней это реально!`
    },
    'voiceAnnoncerPromoValeriaNotification': {
        en: null,
        ru: `С тонким и пленительным голосом Валерии, ваша реклама в мире красоты будет звучать очаровательно. Она великолепно воспроизводит звук с превосходным студийным качеством, оберегая каждый нежный пережив на страницах ваших заметок. Откройте дверь в волшебный мир мягкого звука и доверьте ему свои самые глубокие мысли и идеи. Валерия - залог прекрасного и уникального звукового опыта.`
    },
    'voiceAnnoncerPromoPolinaNotification': {
        en: null,
        ru: `Откройте новые возможности для вашей рекламы в сфере недвижимости с идеальным голосом Полины. Ее деловой тон и убедительная подача не оставят равнодушными даже самых требовательных покупателей. Гарантируем первоклассное звучание студийного качества при помощи Полины. Будьте уверены в качестве ваших аудиороликов и привлекайте новых клиентов с помощью профессионального голоса Полины.`
    },
    'voiceAnnoncerPromoPavelNotification': {
        en: null,
        ru: `Уникальная возможность привлечь внимание клиентов в сфере доставки еды! Представляем вам Павла - идеальное решение для вашей рекламы. Его энергичный тон и убедительная подача приковывают взгляды даже самых требовательных покупателей. Гарантируем первоклассное звучание студийного качества благодаря Павлу. Будьте уверены в качестве ваших аудиороликов и привлекайте новых клиентов с помощью профессионального голоса Павла!`
    },
    'voiceAnnoncerPromoViktorNotification': {
        en: null,
        ru: `Уникальная возможность привлечь внимание клиентов в сфере спортивного питания! Виктор - идеальное решение для вашей рекламы. Его убедительная подача не оставят равнодушными даже самых требовательных клиентов. Получайте первоклассное звучание студийного качества благодаря Виктору.`
    },
    'voiceAnnoncerPromoIvanNotification': {
        en: null,
        ru: `Дайте жизнь вашей рекламе с помощью яркого и энергичного голоса Ивана! Он идеально подойдет для озвучивания финансовых и стартап-проектов, придавая им убедительность и профессионализм.`
    },
    'createNewTicketNotification': {
        en: `ℹ️ Before we begin, please provide a detailed description of the issue you're facing. This will help me understand the problem better and provide you with the most appropriate solution. Thank you!`
    },
    'issueTroubleshootNotification': {
        en: `ℹ️ Please provide a detailed description of the issue you're facing. This will help me understand the problem better and provide you with the most appropriate solution. Thank you!`
    },
    'haveCreatedNewTicketNotification': {
        en: `👍 I made a couple of tickets for you. Take a look whenever you can and share your thoughts. Thanks! 
        \nYour ticket: %1%\nAI tuned ticket: %2%\nIssue type: %3%\nTeam that will work on your ticket: %4%`
    },
    'haveCreateTroubleshootResponseNotification': {
        en: `I have investigated your issue and provided steps to fix it. Please take a look: %1%`
    },    
    'awaitNotification': {
        en: `☕️ Please wait...`
    },
    'startProcessNewTicket': {
        en: `Starting process new ticket. ☕️ Please wait...`
    },
    'almostThereNotification': {
        en: `Almost there 🙂`
    },
    'oopsNotification': {
        en: `😢 Oops, we can't handle your request so far. Please, type: /reset and try again.`
    },
    'stillWorkingOnItNotification': {
        en: `Still working on it...`
    },
    'createTicketContentPrompt': {
        en: `Create a JIRA ticket based on the customer notes, acting as the Product Owner (PO). Additionally, please specify the issue type and use Jira formatting to beautify the ticket.\n\n\n %1%`
    },
    'createTicketClarificationRequiredEmailPrompt': {
        en: `Write follow-up email to the employee that mentioned in the recent email provided below. Ask to provide the additional technical details to proceed further and creating the support ticket.\n\n\n%1%`
    },
    'extractUserNameFromUserInputPrompt': {
        en: `Extract first name from the customer input if it human readable otherwise return "undetected" string. User input is: %1%`
    },
    'followUpEmailCreatedNotification': {
        en: `The follow-up email "Follow-up: %1%" is successfully created and added to the email quue: %2%`
    },
    'createTicketJSONPrompt': {
        en: `Create a JIRA ticket based on the customer notes, acting as the Product Owner (PO). Your response should be json string with the following structure {title: '', issue_type: '[FEATURE, BUG or IMPROVEMENT]'}\n\n\n %1%`
    },
    'verifyIssuePrompt': {
        en: `Verify the issue and provide the next steps how to fix it: %1%. Also beautify the response for the jira`
    },
    'foundNewTicketNotification': {
        en: `ℹ️ I've come across the following tickets that were created by customers:\n\n%1%`
    },
    'noTicketFoundNotification': {
        en: `ℹ️ Looks like there haven't been any new tickets received from customers so far.`
    },
    'ticketSearchCancelNotification': {
        en: `ℹ️ Ticket searching mode has been canceled. Feel free to type /tsearch to resume your search, or /tcreate to create a new ticket or troubleshoot any issues.`
    },
    'ticketCreateExitNotification': {
        en: `I hope I was able to assist you. If you have any more queries or need further help, feel free to type "/tsearch" to search for new tickets, or "/tcreate" to create a new ticket. I'm here to troubleshoot any issues you might have. 🙂`
    },
    'ticketVerificationFailsNotification': {
        en: `⚠️ I'm sorry, but I need some more information in order to create a ticket for you. Could you please provide me with additional details ? Another option if you want to exit from the ticket creation mode. Simply click /reset and you'll be good to go. Hope this helps!`
    },
    'issueVerificationFailsNotification': {
        en: `⚠️ I'm sorry, but I need some more information in order to troubleshoot the issue for you. Could you please provide me with additional details ? Another option if you want to exit from the troubleshoot mode. Simply click /reset and you'll be good to go. Hope this helps!`
    },
    'unableToClassifyTicketNotification': {
        en: `😢 Unfortunately, I was unable to classify some of the tickets due to missing additional information.`
    },
    'unclassifiedTicketNotification': {
        en: `The ticket "%1%": %2% was assigned to Team 4, because clarification is required.`
    },
    'activationCodeRequestNotification': {
        en: `Hey there! We need you to enter your activation code to proceed. Just type it in the box below and hit submit. If you're having trouble finding the code, you can also click on the /reset to exit. Thanks for your cooperation! 🙂`
    },
    'userAlreadyActivatedNotification': {
        en: `Hey there! I just wanted to let you know that everything is all set up and ready for you. You've already completed the activation process, so there's nothing else for you to do. Now, it's time to start using the /integration feature. So, sit back, relax, and enjoy! If you have any questions or need assistance, feel free to ask. Have a great day! 🙂`
    },
    'userActivatedSuccessfulNotification': {
        en: `Hey there! Woo-hoo, congrats on being activated! 🎉 Now, you have the power to enjoy all the amazing /integration features and other cool stuff og GrademeAI. If you need any guidance, just click on /help and we'll be there to assist you. Get ready to have a blast! Enjoy your time here! 😊`
    },
    'activationCodeInvalidNotification': {
        en: `Hi there! It seems like the activation code you provided is not valid. Don't worry though, I'm here to assist you 🙂. Please try entering the code again, ensuring that all characters are correct. If you're still facing any issues, feel free to let me know or just click /reset to exit from the activation mode.`
    },
    'accessDeniedNotification': {
        en: `😢 Hi there! I'm sorry to inform you that your access to that particular feature has been denied. But don't worry, we have a solution for you! To unlock this feature, simply click on the /activate and follow the activation steps. If you have any questions or need further assistance, feel free to ask.`
    },
    'integerationRequestNotification': {
        en: `🎉 Introducing GrademeAI Integration Feature! 🤖✨

Harness the incredible power of AI to revolutionize your ticket system and customer support processes. With GrademeAI, classifying your tickets, handling customer requests, providing troubleshooting assistance, and so much more becomes effortless!
        
✅ Simplify Ticket Classification: GrademeAI's advanced algorithms can analyze and accurately categorize your Jira tickets, saving you time and ensuring swift resolution.
        
✅ Seamlessly Handle Customer Requests: By integrating GrademeAI, you can easily manage customer queries and requests, enhancing your support team's efficiency and responsiveness.
        
✅ Troubleshoot Assistance Made Easy: Let GrademeAI take charge of troubleshooting by identifying common issues, suggesting viable solutions, and keeping your assistance alive and thriving.
        
✅ Unlock the Full Potential of AI: Experience the endless possibilities of AI integration with GrademeAI, as we constantly evolve to meet your unique business needs and demands.
        
Stay ahead of the game with GrademeAI's cutting-edge AI integration feature, enabling you to streamline your ticketing process, elevate customer satisfaction, and optimize your workflow. Try GrademeAI today and witness the true power of AI in action! 🚀🤖✨`
    },
    'integrationIntroduceNotification': {
        en: `I have prepared the list of available commands for you..🙂

1️⃣ Simplify Ticket Classification in matter of seconds: /tsearch\n
2️⃣ Troubleshoot Assistance and Handle Customer Requests /tcreate
`
    },
    'requestForUserNameNotification': {
        en: `👋 Hello there! I'm GrademeAI, your virtual buddy. May I know what should I call you ?`
    },
    'userNameIsNotRecognizedNotification': {
        en: `I apologize for the confusion, but I don't seem to recognize your name. Could you please let me know your name once again ?`
    },
    'userNameIsRecognizedNotification': {
        en: `Hey %1%! It's such a pleasure to meet you. If you would like to activate your account, all you need to do is click on the /activate. In case you need more information or assistance, feel free to check out /help. Let me know if there's anything else I can do for you.`
    },
}

const notification = {
    getByKey(key, user, ...values) {
        let text;
        userLanguage.isLanguageCodeEn(user.languageCode) ? text = map[key].en ?? map[key].ru : text = map[key].ru ?? map[key].en
        text = notification.replacePlaceholders(text, ...values)
        return format.removeExtraSpaces(text);
    },
    getByKeyRaw(key, user, ...values) {
        let text;
        userLanguage.isLanguageCodeEn(user.languageCode) ? text = map[key].en ?? map[key].ru : text = map[key].ru ?? map[key].en
        return notification.replacePlaceholders(text, ...values)

    },
    replacePlaceholders(text, ...values) {
        for (let i = 1; i <= values.length; i++) {
            const placeholder = `%${i}%`;
            text = text.replace(placeholder, values[i - 1]);
        }
        return text;
    },
    getOopsNotification(user) {
        return notification.getByKey('oopsNotification', user)
    },
    getUserNameIsNotRecognizedNotification(user) {
        return notification.getByKey('userNameIsNotRecognizedNotification', user)
    },
    getUserNameIsRecognizedNotification(user, ...values) {
        return notification.getByKey('userNameIsRecognizedNotification', user, ...values)
    },
    getRequestForUserNameNotification(user) {
        return notification.getByKey('requestForUserNameNotification', user)
    },
    getIntegrationIntroduceNotification(user, values) {
        return notification.getByKeyRaw('integrationIntroduceNotification', user, values)
    },
    getTrialSubscriptionExceededNotification(user, values) {
        return notification.getByKey('trialSubscriptionExceededNotification', user, values)
    },
    getInputTokenLimitExceededNotificationSubscribed(user, values) {
        return notification.getByKey('inputTokenLimitExceededNotificationSubscribed', user, values)
    },
    getInputTokenLimitExceededNotificationUnSubscribed(user, values) {
        return notification.getByKey('inputTokenLimitExceededNotificationUnSubscribed', user, values)
    },
    getHoldOnNotification(user, values) {
        return notification.getByKey('holdOnNotification', user, values)
    },
    getAccessDeniedNotification(user, values) {
        return notification.getByKey('accessDeniedNotification', user, values)
    },
    getActAsNotification(user, map) {
        let value;
        userLanguage.isLanguageCodeEn(user.languageCode) ? value = map.label : value = map.label_ru
        return notification.getByKey('actAsNotification', user, value)
    },
    getSubscriptionInfoNotification(user) {
        let message;
        // Premium
        if (user.isLastPaymentSuccessfull) {
            message = notification.getByKeyRaw(
                'premiumSubscriptionNotification',
                user,
                user.gpt4UssageLimit,
                user.currentAI,
                user.actAs,
                user.translateTo == 'tr_stop' ? 'Disabled' : 'Enabled',
                user.languageCode
            )
        } else {
            message = notification.getByKeyRaw(
                'freeSubscriptionNotification',
                user,
                user.availableCreditsForTrialSubscription,
                user.currentAI,
                user.actAs,
                user.languageCode
            )
        }

        return message
    },
    getResetNotification(user) {
        return notification.getByKey('resetNotification', user)
    },
    getCreateNewTicketNotification(user) {
        return notification.getByKey('createNewTicketNotification', user)
    },
    getAwaitNotification(user) {
        return notification.getByKey('awaitNotification', user)
    },
    getAlmostThereNotification(user) {
        return notification.getByKey('almostThereNotification', user)
    },
    getStillWorkingOnItNotification(user) {
        return notification.getByKey('stillWorkingOnItNotification', user)
    },
    getStartProcessNewTicketNotification(user) {
        return notification.getByKeyRaw('startProcessNewTicket', user)
    },
    getCreateTicketContentPrompt(user, ...values) {
        return notification.getByKeyRaw('createTicketContentPrompt', user, ...values)
    },
    getExtractUserNameFromUserInputPrompt(user, ...values) {
        return notification.getByKeyRaw('extractUserNameFromUserInputPrompt', user, ...values)
    },
    getActivationCodeRequestNotification(user, ...values) {
        return notification.getByKeyRaw('activationCodeRequestNotification', user, ...values)
    },
    getActivationCodeInvalidNotification(user, ...values) {
        return notification.getByKeyRaw('activationCodeInvalidNotification', user, ...values)
    },
    getUserAlreadyActivatedNotification(user, ...values) {
        return notification.getByKeyRaw('userAlreadyActivatedNotification', user, ...values)
    },
    getUserActivatedSuccessfulNotification(user, ...values) {
        return notification.getByKeyRaw('userActivatedSuccessfulNotification', user, ...values)
    },
    getFollowUpEmailCreatedNotification(user, ...values) {
        return notification.getByKeyRaw('followUpEmailCreatedNotification', user, ...values)
    },
    getIntegerationRequestNotification(user, ...values) {
        return notification.getByKeyRaw('integerationRequestNotification', user, ...values)
    },
    getCreateTicketClarificationRequiredEmailPrompt(user, ...values) {
        return notification.getByKeyRaw('createTicketClarificationRequiredEmailPrompt', user, ...values)
    },
    getCreateTicketJSONPrompt(user, ...values) {
        return notification.getByKeyRaw('createTicketJSONPrompt', user, ...values)
    },
    getVerifyIssuePrompt(user, ...values) {
        return notification.getByKeyRaw('verifyIssuePrompt', user, ...values)
    },
    getFoundNewTicketNotification(user, ...values) {
        return notification.getByKeyRaw('foundNewTicketNotification', user, ...values)
    },
    getNoTicketFoundNotification(user) {
        return notification.getByKeyRaw('noTicketFoundNotification', user)
    },
    getHaveCreatedNewTicketNotification(user, ...values) {
        return notification.getByKeyRaw('haveCreatedNewTicketNotification', user, ...values)
    },
    getHaveCreateTroubleshootResponseNotification(user, ...values) {
        return notification.getByKeyRaw('haveCreateTroubleshootResponseNotification', user, ...values)
    },
    getUnclassifiedTicketNotification(user, ...values) {
        return notification.getByKeyRaw('unclassifiedTicketNotification', user, ...values)
    },
    getIssueTroubleshootNotification(user) {
        return notification.getByKey('issueTroubleshootNotification', user)
    },
    getTicketCreateExitNotification(user) {
        return notification.getByKey('ticketCreateExitNotification', user)
    },
    getTicketVerificationFailsNotification(user) {
        return notification.getByKey('ticketVerificationFailsNotification', user)
    },
    getIssueVerificationFailsNotification(user) {
        return notification.getByKey('issueVerificationFailsNotification', user)
    },
    getTicketSearchCancelNotification(user) {
        return notification.getByKey('ticketSearchCancelNotification', user)
    },
    getUnableToClassifyTicketNotification(user) {
        return notification.getByKey('unableToClassifyTicketNotification', user)
    },
    getCreateVoiceCancelNotification(user) {
        return notification.getByKey('createVoiceCancelNotification', user)
    },
    getCreateVoiceConfirmNotification(user) {
        return notification.getByKey('createVoiceConfirmNotification', user)
    },
    getVoiceCreatedNotification(user) {
        return notification.getByKey('voiceCreatedNotification', user)
    },
    getResetCancelNotification(user) {
        return notification.getByKey('resetCancelNotification', user)
    },
    getPremiumSubscriptionInfoNotification(user) {
        return notification.getByKeyRaw('premiumSubscriptionInfoNotification', user)
    },
    getVoiceSpeakingRateValidationFailiedNotification(user) {
        return notification.getByKeyRaw('voiceSpeakingRateValidationFailiedNotification', user)
    },
    getVoicePitchValidationFailiedNotification(user) {
        return notification.getByKeyRaw('voicePitchValidationFailiedNotification', user)
    },
    getVoiceTextInputNotification(user) {
        return notification.getByKeyRaw('voiceVoiceTextInputNotification', user)
    },
    getVoiceSSMLEnableNotification(user) {
        return notification.getByKeyRaw('voiceSSMLEnableNotification', user)
    },
    getVoiceSSMLDisableNotification(user) {
        return notification.getByKeyRaw('voiceSSMLDisableNotification', user)
    },
    getVoiceEnterPitchValueNotification(user) {
        return notification.getByKeyRaw('voiceEnterPitchValueNotification', user)
    },
    getVoiceEnterSpeakingRateValueNotification(user) {
        return notification.getByKeyRaw('voiceEnterSpeakingRateValueNotification', user)
    },
    getVoiceIntroduceNotification(user) {
        return notification.getByKeyRaw('voiceIntroduceNotification', user)
    },
    getVoiceAnnoncerPromoEmilyNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoEmilyNotification', user)
    },
    getVoiceAnnoncerPromoMadisonNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoMadisonNotification', user)
    },
    getVoiceAnnoncerPromoJaneNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoJaneNotification', user)
    },
    getVoiceAnnoncerPromoAvaNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoAvaNotification', user)
    },
    getVoiceAnnoncerPromoElizabethNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoElizabethNotification', user)
    },
    getVoiceAnnoncerPromoAidenNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoAidenNotification', user)
    },
    getVoiceAnnoncerPromoBenjaminNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoBenjaminNotification', user)
    },
    getVoiceAnnoncerPromoJacobNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoJacobNotification', user)
    },
    getVoiceAnnoncerPromoDavidNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoDavidNotification', user)
    },
    getVoiceAnnoncerPromoValentinaNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoValentinaNotification', user)
    },
    getVoiceAnnoncerPromoValeriaNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoValeriaNotification', user)
    },
    getVoiceAnnoncerPromoPolinaNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoPolinaNotification', user)
    },
    getVoiceAnnoncerPromoPavelNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoPavelNotification', user)
    },
    getVoiceAnnoncerPromoViktorNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoViktorNotification', user)
    },
    getVoiceAnnoncerPromoIvanNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoIvanNotification', user)
    },
    getVoiceAnnoncerPromoAndrewNotification(user) {
        return notification.getByKeyRaw('voiceAnnoncerPromoAndrewNotification', user)
    },
    getSharePremiumSubscriptionLinkNotification(user) {
        return notification.getByKeyRaw('sharePremiumSubscriptionLinkNotification', user, user.paymentLink)
    },
    getFeatureLockNotification(user) {
        return notification.getByKeyRaw('featureLockNotification', user)
    },
    getAskRandText(user) {
        return notification.getByKeyRaw('askRandNotification', user)
    },
    getGenerateImgNoDescriptionNotification(user) {
        return notification.getByKey('generateImgNoDescriptionNotification', user)
    },
    getAskRandAfterText(user, text) {
        return notification.getByKeyRaw('askRandNotificationAfterText', user, text)
    },
    getHelpRequestNotification(user) {
        return notification.getByKeyRaw('helpNotification', user)
    },
    getTrialSubscriptionDaylyLimitExceededNotification(user) {
        return notification.getByKey('trialSubscriptionDaylyLimitExceededNotification', user)
    },
    getStartNotification(user) {
        if (user.isLastPaymentSuccessfull) {
            message = notification.getByKeyRaw(
                'startRequestSubscribedNotification',
                user
            )
        } else {
            message = notification.getByKeyRaw(
                'startRequestNotification',
                user
            )
        }

        return message
    },
    getApiFailureToRespondNotification(user) {
        return notification.getByKey('apiFailureToRespondNotification', user)
    },
    getApiFailureToRespondNotificationChat(user) {
        return notification.getByKey('apiFailureToRespondNotificationChat', user)
    },
    getResetTipNotification(user) {
        return notification.getByKey('resetTipNotification', user)
    },
    getImgTipNotification(user) {
        return notification.getByKey('imgTipNotification', user)
    },
    getActTipNotification(user) {
        return notification.getByKey('actTipNotification', user)
    },
    getVoiceTipNotification(user) {
        return notification.getByKey('voiceTipNotification', user)
    },
    getTrTipNotification(user) {
        return notification.getByKey('trTipNotification', user)
    },
    getAiTipNotification(user) {
        return notification.getByKey('aiTipNotification', user)
    },
    getGpt4LimitExceededNotification(user) {
        return notification.getByKey('gpt4LimitExceededNotification', user)
    }
}

module.exports = { notification };