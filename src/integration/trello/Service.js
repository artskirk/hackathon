'use strict';

const axios = require('axios');
const trello = {
    apiCardUrl: 'https://api.trello.com/1/cards',
    apiListUrl: 'https://api.trello.com/1/lists',
    apiKey: '2c9bccf6d2467058e0a02eb1302af4d2',
    apiToken: 'ATTA6601c8461c74235432408f418fe3dd7479173941cfea7cc3354d76a9e66cb7de0F333F32',
    backlogListId: '64f7323513d35a2701d15a06',
    debugListId: '64fc345156410dc39f352e41',
    unclassifiedListId: '64f9ef22b4d22c3a186a7708',
    emailQueueListId: '64fadae637e6fc5ef3f29a6c'
};

trello.createNewTicket = async function (
    title,
    description,
    listId = trello.backlogListId) {
    const requestData = {
        name: title,
        desc: description,
        idList: listId,
        key: trello.apiKey,
        token: trello.apiToken,
    };

    try {
        const response = await axios.post(trello.apiCardUrl, requestData);        
        return response.data;
    } catch (error) {
        return null
    }
}

trello.createNewAIBacklogTicket = async function (
    title,
    description,
    listId = '64fb21b3e0c31330050f2961') {
    const response = await trello.createNewTicket(title, description, listId)
    return response
}

trello.assignTicketToSpecificTeam = async function (title, description, issueType) {
    let listId = trello.unclassifiedListId
    const issueTypes = [
        { listId: '64f878874641e1860c78a01c', name: 'BUG' },
        { listId: '64fb21d910275a6ebdba5533', name: 'FEATURE' },
        { listId: '64fb21fea525b6c60e3bfa64', name: 'IMPROVEMENT' },
    ];

    const matchingIssueType = issueTypes.find(type => type.name === issueType);
    if (matchingIssueType) {
        listId = matchingIssueType.listId;
    }

    const response = await trello.createNewTicket(title, description, listId);
    return response;
};

trello.searchNewTickets = async function (listId = trello.backlogListId) {
    const getCardsUrl = `${trello.apiListUrl}/${listId}/cards`
    const queryParams = {        
        key: trello.apiKey,
        token: trello.apiToken,
    };

    try {
        const response = await axios.get(getCardsUrl, { params: queryParams });
        return response.data;
    } catch (error) {
        return null
    }
}


module.exports = { trello };