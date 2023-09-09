const moment = require('moment-timezone');
const Queue = {
    userId: '',
    messageId: '',
    resolved: true,
    dateCreated: moment().toDate(),
};

module.exports = Queue;