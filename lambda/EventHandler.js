'use strict';

const uuid = require('uuid/v4');
const Event = require('./model/Event');
const Node = require('./model/Node');
const Responder = require('./lib/Responder');

module.exports.put = (event, context, callback) =>
{
    const data = JSON.parse(event.body);

    Event.create({
        brewNodeUuid: data.brewNodeUuid,
        type: data.type,
        value: String(data.value),
        createdAt: new Date().toISOString()
    }, {}, (err, item, response) => {

        if (err) {
            return Responder.respond(callback, 'Unable to put Event: '+ err);
        }

        if (data.type !== 'temperature_reading') {
            return Responder.respond(callback);
        }

        Node.update({uuid: data.brewNodeUuid, currentTemperature: data.value}, (error, node) => {
            return Responder.respond(callback, error);
        });
    });
};