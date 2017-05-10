'use strict';

const AWS = require("aws-sdk");
const uuid = require('uuid/v4');

// var Datastore = require('../daemon/datastore.js');

module.exports.put = (event, context, callback) => {

    var data = JSON.parse(event.body);
    // var datastore = new Datastore();
    //
    // var node = datastore.put(Datastore.NODE_TABLE_NAME, data);

    const response = {
        statusCode: 200,
        body: JSON.stringify({ result: true, node: node })
    };

    callback(null, response);
};

module.exports.updateSettings = (event, context, callback) => {

    var data = JSON.parse(event.body);
    var docClient = new AWS.DynamoDB.DocumentClient();

    var updateExpression = 'set ';
    var expressionAttributes = {};

    for (var field in data) {
        updateExpression += 'settings.'+field+' = :'+field+',';
        expressionAttributes[':'+field] = data[field];
    }
    updateExpression = updateExpression.slice(0, -1);

    var params = {
        TableName: 'Node',
        Key: { uuid: event.pathParameters.uuid },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributes,
        ReturnValues: 'UPDATED_NEW'
    };

    docClient.update(params, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
            callback(null, {
                statusCode: 500,
                body: JSON.stringify({ result: false })
            });
        }
        callback(null, {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS }
            },
            body: JSON.stringify({ result: true })
        });
    });
};

module.exports.get = (event, context, callback) => {

    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: 'Node',
        Key: { uuid: event.pathParameters.uuid }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to fetch item. Error JSON:", JSON.stringify(err, null, 2));
            callback(null, {
                statusCode: 500,
                body: JSON.stringify({ result: false })
            });
        }
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


