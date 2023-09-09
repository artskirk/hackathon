require('dotenv').config({ path: '../../.env' });
const { CLIENT_TOKEN, TELEGRAM_API_URL, SERVER_URL, VIDEO_PATH, VOICE_PATH, IMAGE_PATH } = process.env
const axios = require('axios')
const CLIENT_API = TELEGRAM_API_URL + CLIENT_TOKEN;
const { logger } = require('../Logger')

const sendTypingAction = async (chatId) => {
    await axios.post(`${CLIENT_API}/sendChatAction`, {
        chat_id: chatId,
        action: 'typing'
    })
}

const pingUser = async (chatId, text) => {
    let result
    if (text) {
        await sendTypingAction(chatId)
        result = await axios.post(`${CLIENT_API}/sendMessage`, {
            chat_id: chatId,
            text: text
        })
    } else {
        result = await sendTypingAction(chatId)
    }

    return result;
}

const sendButton = async (chatId, messageContent, tree) => {
    try {
        const response = await axios.post(`${CLIENT_API}/sendMessage`, {
            chat_id: chatId,
            text: messageContent,
            reply_markup: {
                inline_keyboard: tree,
                resize_keyboard: true,
            },
        })
    } catch (error) {
        logger.log({ level: 'error', message: error });
    }
}

const sendVideo = async (chatId, messageContent, fileName) => {
    try {
        const videoUrlPath = SERVER_URL + VIDEO_PATH
        const videoUrl = `${videoUrlPath + fileName}.mp4`
        await axios.post(`${CLIENT_API}/sendAnimation`, {
            chat_id: chatId,
            animation: videoUrl,
            caption: messageContent
        })    
        logger.log({
            level: 'info', message: {
                description: `Send video action. Video URL is: ${videoUrl}. Caption: ${messageContent}.`
            }
        });
    } catch (error) {
        logger.log({
            level: 'error', message: {
                description: `Unable to send video. Url: ${videoUrl}`,
                trace: error
            }
        });
    }
}

const sendImage = async (chatId, messageContent, fileName) => {
    try {
        const imgPath = SERVER_URL + IMAGE_PATH + fileName
        await axios.post(`${CLIENT_API}/sendPhoto`, {
            chat_id: chatId,
            photo: imgPath,
            caption: messageContent
        })
    } catch (error) {
        logger.log({
            level: 'error', message: {
                description: `Unable to send image. Path: ${imgPath}`,
                trace: error
            }
        });
    }
}

const sendVoice = async (chatId, messageContent, voiceFilename) => {
    try {
        const voiceUrl = SERVER_URL + VOICE_PATH + voiceFilename
        logger.log({
            level: 'info', message: `Voice URL is: ${voiceUrl}`
        });
        await axios.post(`${CLIENT_API}/sendVoice`, {
            chat_id: chatId,
            voice: voiceUrl,
            caption: messageContent
        });

        logger.log({
            level: 'info',
            message: {
                description: `Audio sent successfully. Path: ${voiceUrl}`,
            }
        });
    } catch (error) {
        let errorMessage = `Unable to send MP3 audio. Path: ${voiceUrl}`
        logger.log({
            level: 'error', message: {
                description: errorMessage,
                trace: error
            }
        });
        throw new Error(errorMessage)
    }
}


module.exports = { pingUser, sendButton, sendVideo, sendVoice, sendImage };