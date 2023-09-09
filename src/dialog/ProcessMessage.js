const { logger } = require('../Logger');
const { getResponsefromAI } = require('../openai/models/Gpt');
const { generateImage } = require('../openai/models/Dalle');
const { userActivity } = require('../helper/UserActivityHelper');
const { pingUser } = require('./PingUser');

const processMessage = async (message, user) => {
    let text;
    try {
        text = message.text ? await getValidatedResponse(message, user) : "Sorry, I don't work with attachments, though.";
        return text;
    } catch (error) {
        logger.log({
            level: 'error', message: {
                error: 'Oops, something went wrong!',
                details: error
            }
        });
        throw error;
    }
}

const getValidatedResponse = async (message, user) => {

    const MIN_TEXT_LENGTH = 2;

    if (message.text.length < MIN_TEXT_LENGTH) {
        const response = await getResponsefromAI(`IF text is understandable return 1 else return 0. The text is: ${message.text}`);
        if (response !== 1) {
            return 'Sorry, could you please provide more detail in your question?';
        }
    }

    const text = userActivity.detectImageRequest(message.text)
        ? pingUser(message.chat.id, 'Please wait... ☕️') && await generateImage(message.text)
        : await getResponsefromAI(message.text, user);

    return text;
};

module.exports = { processMessage };