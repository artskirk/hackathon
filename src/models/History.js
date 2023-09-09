const uniqueValidator = require('mongoose-unique-validator');
const moment = require('moment-timezone');
const User = {
    userId: '',
    userRequest: '',
    userResponse: '',    
    dateCreated: moment().toDate(),
};

module.exports = User;