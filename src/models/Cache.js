const moment = require('moment-timezone');
const Cache = {
    userId: '',
    messageId: '',
    messageText: '',
    dateCreated: moment().toDate(),
};

module.exports = Cache;