require('dotenv').config({ path: '../../.env' });
const { TELEGRAM_API_URL, CLIENT_TOKEN, OAI_MODEL_GPT_DEFAULT, OAI_GPT4 } = process.env
const { logger } = require('../Logger')
const { processMessage } = require('../dialog/ProcessMessage')
const { getCompletionFromAI } = require('../openai/models/Gpt');
const { notification } = require('../dialog/Notification')
const { button } = require('../asset/button.js')
const { logUserHistory } = require('../dialog/history/Logger')
const { pingUser, sendButton, sendVideo } = require('../dialog/PingUser')
const { findUser } = require('../db/User')
const { callbackQueryProcessor } = require('../processor/CallbackQueryProcessor')
const { queue } = require('../db/Queue')
const { cache } = require('../db/Cache')
const { userLanguage } = require('../helper/UserLanguageHelper')
const { userActivity } = require('../helper/UserActivityHelper')
const { format } = require('../helper/FormatMessageHelper')
const { tokenManagement } = require('../helper/TokenManagementHelper')
const User = require('../models/User')
const axios = require('axios')
const CLIENT_API = TELEGRAM_API_URL + CLIENT_TOKEN;

module.exports = async (req, res, next) => {
    try {
        let apiKey = req.headers?.apikey;
        let forward = req.headers?.forward;

        if (!apiKey) {
            res.status(401).send('ApiKey is not provided.');
            return;
        } else {
            apiKey = parseInt(String(apiKey));
        }

        let rawData = '';

        req.on('data', (chunk) => {
            rawData += chunk;
        });

        req.on('end', async () => {
            req.rawBody = rawData;

            logger.log({
                level: 'info',
                message: {
                    api: `data was received from endpoint /devtools/code/verify/.`,
                    api_key: apiKey ?? '',
                    data: rawData,
                    forward: `value ${forward} type ${typeof forward}`
                }
            });

            const user = await findUser(apiKey)

            if (!user?._id) {
                logger.log({
                    level: 'info',
                    message: {
                        api: `Customer with apiKey ${apiKey} is not authorized. Endpoint: /devtools/code/verify/.`,
                        api_key: apiKey ?? '',
                        user: user
                    }
                });
                res.status(401).send('Unauthorized');
            } else {
                const command = `Verify the issue, provide the next steps: \r\n\r\r\n${rawData}`
                const verificationResponse = await getCompletionFromAI(command, user)

                // Send the response as JSON
                res.json({ verificationResponse });

                // Forward to the chanel
                if (forward == 1) {
                    await pingUser(user.chatId, verificationResponse)
                }
                
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};