require('dotenv').config({ path: '../../../.env' });
const { CLIENT_TOKEN, TELEGRAM_API_URL } = process.env
const axios = require('axios')
const CLIENT_API = TELEGRAM_API_URL + CLIENT_TOKEN;

const pingUser = async (chatId, text) => {
    const result = await axios.post(`${CLIENT_API}/sendMessage`, {
        chat_id: chatId,
        text: text
    })
    return result;
}

module.exports = { pingUser };

pingUser('', 'Привет! Я заметил, что уже давно не общались и мне так не хватает наших бесед. Как твои дела? Надеюсь, что всё хорошо. Давай скорее поговорим и обменяемся новостями!');
