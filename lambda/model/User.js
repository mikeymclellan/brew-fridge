var dynamo = require('dynamodb');
var Joi = require('joi');

module.exports = dynamo.define('Node', {
    hashKey: 'id',
    tableName: 'User',
    timestamps: true,
    schema: {
        id: Joi.string(),
        email: Joi.string(),
        settings: {
            targetTemperature: Joi.string()
        },
        nodeUuids: dynamo.types.stringSet()
    }
});
