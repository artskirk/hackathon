require('dotenv').config({ path: '../../.env' });
const { ACTIVATION_CODE } = process.env
const moment = require('moment-timezone');
const userActivity = {
    detectImageRequest(prompt) {
        return /^\/img/.test(prompt);
    },
    detectStartRequest(prompt) {
        return userActivity.detect(prompt, 'start');
    },
    detectImageNoDescriptionRequest(prompt) {
        return userActivity.detect(prompt, 'img');
    },
    detectActivationRequest(prompt) {
        return userActivity.detect(prompt, 'activate');
    },
    detectCreateTicketRequest(prompt) {
        return userActivity.detect(prompt, 'tcreate');
    },
    detectSearchNewTicketRequest(prompt) {
        return userActivity.detect(prompt, 'tsearch');
    },
    detectIntegrationRequest(prompt) {
        return userActivity.detect(prompt, 'integration');
    },
    detectTestRequest(prompt) {
        return userActivity.detect(prompt, 'devTest');
    },
    detectHelpRequest(prompt) {
        return userActivity.detect(prompt, 'help');
    },
    detectRepeatMessgeRequest(prompt) {
        return userActivity.detect(prompt, 'repeat');
    },
    detectVoiceRequest(prompt) {
        return userActivity.detect(prompt, 'voice');
    },
    detectAIModelRequest(prompt) {
        return userActivity.detect(prompt, 'ai');
    },
    detectActAsRequest(prompt) {
        return userActivity.detect(prompt, 'act');
    },
    detectTranslationRequest(prompt) {
        return userActivity.detect(prompt, 'tr');
    },
    detectSelectLanguageRequest(prompt) {
        return userActivity.detect(prompt, 'lang');
    },
    detectInfoRequst(prompt) {
        return userActivity.detect(prompt, 'info');
    },
    detectResetRequest(prompt) {
        return userActivity.detect(prompt, 'reset');
    },
    detectPremiumSubscriptionInfoRequest(prompt) {
        return userActivity.detect(prompt, 'premium');
    },
    detectAskRandRequest(prompt) {
        return userActivity.detect(prompt, 'askrand');
    },
    detect(prompt, shortcut) {
        return new RegExp('^\\/' + shortcut + '$').test(prompt);
    },
    markCurrentInMap(map, optionId, optionIdByDefault) {
        let currentOptionId = optionId || optionIdByDefault;

        if (!map.length) {
            return map;
        }

        // create a deep copy of the map array
        let mapCopy = JSON.parse(JSON.stringify(map));

        for (let i = 0; i < mapCopy.length; i++) {
            for (let j = 0; j < mapCopy[i].length; j++) {
                if (mapCopy[i][j].callback_data === currentOptionId) {
                    let buttonText = mapCopy[i][j].text;
                    if (buttonText.indexOf(this.getCurrentIcon()) === -1) {
                        mapCopy[i][j].text = `${this.getCurrentIcon()} ${buttonText}`;
                    }
                    break;
                }
            }
        }

        // return the copy of the map array
        return mapCopy;
    }
    ,
    getCurrentIcon() {
        return '✅ '
    },
    getLockIcon() {
        return '🔒';
    },
    getHintIcon() {
        return '💡 '
    },
    getHelloIcon() {
        return '👋'
    },
    getDiceIcon() {
        return '🎲';
    },
    getDangerIcon() {
        return '⚠️';
    },
    getInfoIcon() {
        return 'ℹ️';
    },
    getStarIcon() {
        return '⭐️';
    },
    getFlagIcon() {
        return '🇺🇸';
    },
    getBrainIcon() {
        return '🧠';
    },
    getTimeoutIcon() {
        return '☕️';
    },
    getTrialUsageExpiredAt(trialUsageExpiredAt) {
        const now = moment();
        const trialUsageExpiredTime = trialUsageExpiredAt ? moment(trialUsageExpiredAt) : now.clone().add(1, 'day');
        return trialUsageExpiredTime.format('YYYY-MM-DD HH:mm:ss');
    },
    isTrialUsageExpired(trialUsageExpiredAt) {
        const now = moment();
        const trialUsageExpiredTime = userActivity.getTrialUsageExpiredAt(trialUsageExpiredAt)
        return now > moment(trialUsageExpiredTime);
    },
    isActivationCodeValid: (userInput) => userInput === ACTIVATION_CODE,
    isTrialUser: (user) => !user.isLastPaymentSuccessfull
}

module.exports = { userActivity };