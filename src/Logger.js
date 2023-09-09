require('dotenv').config({ path: '../../.env' });
const { ERROR_LOG_FILE, PAYMENT_LOG_FILE, DEFAULT_LOG_FILE } = process.env
const winston = require('winston');
const loggingLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        payment: 3,
        verbose: 4,
        debug: 5,
        silly: 6
    }
};

const logger = winston.createLogger({
    level: 'info',
    levels: loggingLevels.levels,
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: ERROR_LOG_FILE, level: 'error' }),
        new winston.transports.File({ filename: PAYMENT_LOG_FILE, level: 'payment' }),
        new winston.transports.File({ filename: DEFAULT_LOG_FILE }),
    ],
});

module.exports = { logger };