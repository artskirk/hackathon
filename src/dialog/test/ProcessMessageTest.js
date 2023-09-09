const { getResponsefromAI } = require('../../openai/models/Gpt');

const getValidatedResponse = async (message) => {
    const text = await getResponsefromAI(message.text);
    console.log(text);
    return text;
};

const message = {text: 'Привет. Как дела ?'};
getValidatedResponse(message);