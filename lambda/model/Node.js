var dynamo = require('dynamodb');
var Joi = require('joi');

module.exports = dynamo.define('Node', {
    hashKey: 'uuid',
    tableName: 'Node',
    timestamps: true,
    schema: {
        uuid: dynamo.types.uuid(),
        userId: Joi.string(),
        settings: {
            targetTemperature: Joi.string()
        },
        currentTemperature: Joi.number()
    }
});

