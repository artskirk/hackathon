require('dotenv').config({ path: '../../../.env' });
const { DB_NAME } = process.env
const { MongoClient } = require('mongodb');
const { client } = require('../../db/Client');
const { abstractCollection } = require('../../db/AbstractCollection');
const History = require('../../models/History');
const { logger } = require('../../Logger');
const collectionName = 'History';

async function logUserHistory(user) {
    try {
        const newHistory = {
            ...History,
            userId: user._id,
            userRequest: user.userRequest.trim(),
            userResponse: user.userResponse.trim(),
        };
        const collection = await abstractCollection.getCollection(collectionName);
        const result = await collection.insertOne(newHistory);
        if (result.insertedId) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        logger.log({
            level: 'error', message: {
                errorMessage: 'Unable to log  user history',
                errorDetails: error
            }
        });
        return false;
    } finally {
        await client.close();
    }

}

module.exports = { logUserHistory };