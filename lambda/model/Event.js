var dynamo = require('dynamodb');
var Joi = require('joi');

module.exports = dynamo.define('Event', {
    hashKey: 'brewNodeUuid',
    rangeKey: 'createdAt',
    tableName: 'Event',
    schema: {
        uuid: dynamo.types.uuid(),
        brewNodeUuid: dynamo.types.uuid(),
        createdAt: Joi.string(),
        type: Joi.string(),
        value: Joi.string()
    }
});

