require('dotenv').config()
const { CLIENT_TOKEN, TELEGRAM_API_URL, SERVER_URL, PORT, CRON_SCHEDULE } = process.env
const express = require('express')
const axios = require('axios')
const { logger } = require('./src/Logger');
const bodyParser = require('body-parser')
const app = express()
const URI = `/webhook/${CLIENT_TOKEN}`
const WEBHOOK_URL = SERVER_URL + URI
const CLIENT_API = TELEGRAM_API_URL + CLIENT_TOKEN;
const stripePaymentSuccessMiddleware = require('./src/middleware/StripePaymentSuccess');
const verifyCodeMiddleware = require('./src/middleware/VerifyCode');
const jiraMiddleware = require('./src/middleware/Jira');
const messengerWebhook = require('./src/middleware/MessengerWebhook');
const imageRedirect = require('./src/middleware/ImageRedirect');
app.use(bodyParser.json())
const path = require('path')
app.use(express.static('public'))

const init = async () => {
    const res = await axios.get(`${CLIENT_API}/setWebhook?url=${WEBHOOK_URL}`)
    logger.log({ level: 'info', message: 'GET OK: ' + `${CLIENT_API}/setWebhook?url=${WEBHOOK_URL}` });
}

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, './public/index.html'))
})
app.get('/image/*', imageRedirect)
app.post('/stripe/webhook/', express.raw({ type: 'application/json' }), stripePaymentSuccessMiddleware)
app.post('/rest/v1/devtools/code/verify/', verifyCodeMiddleware)
app.post('/rest/v1/devtools/jira/ticket/create', jiraMiddleware)
app.post('/webhook/*', messengerWebhook)


app.listen(process.env.PORT, async () => {
    logger.log({
        level: 'info',
        message: 'App running on port ' + process.env.PORT
    });
    try {
        await init()
    } catch (error) {
        logger.log({
            level: 'error',
            message: {
                errorDescription: 'Init failied on index.js',
                error: error
            }
        });
    }
});