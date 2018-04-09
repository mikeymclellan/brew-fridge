'use strict';

const AWS = require("aws-sdk");
const uuid = require('uuid/v4');
const Request = require('./lib/Request');
const Responder = require('./lib/Responder');
const Node = require('./model/Node');

module.exports.register = (event, context, callback) => {

    Node.create({}, {}, (err, item, response) => {

        if (err) {
            return Responder.respond(callback, 'Unable to register node:' + err);
        }
        return Responder.respond(callback, item);
    });
};

module.exports.updateSettings = (event, context, callback) => {

    Request.verifyUser(event, (error, user) => {
        if (error) {
            return Responder.respond(callback, error);
        }

        var data = JSON.parse(event.body);

        Node.get({uuid: event.pathParameters.uuid}, (error, node) => {
            if (error) {
                return Responder.respond(callback, error);
            }

            if (node.get('userId') !== user.sub) {
                return Responder.respond(callback, 'User not allowed, node: '+node.get('uuid')+', userid: '+user.sub, 403);
            }

            Node.update({uuid: node.get('uuid'), settings: data}, (error, node) => {
                return Responder.respond(callback, error);
            });
        });
    });
};

module.exports.get = (event, context, callback) => {

    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: 'Node',
        Key: { uuid: event.pathParameters.uuid }
    };

    // TODO: update to use `Node` model
    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to fetch item. Error JSON:", JSON.stringify(err, null, 2));
            callback(null, {
                statusCode: 500,
                body: JSON.stringify({ result: false })
            });
        }
        // TODO: update to use `Responder`
        callback(null, {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS }
            },
            body: JSON.stringify({ result: true, node: data.Item })
        });
    });
};


