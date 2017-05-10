const AWS = require("aws-sdk");
const uuid = require('uuid/v4');

function Datastore(config) {
    this.config = config;
    AWS.config.update({
        region: config.aws.region,
        accessKeyId: config.aws.key,
        secretAccessKey: config.aws.secret
    });
    this.dynamodb = new AWS.DynamoDB();
    this.docClient = new AWS.DynamoDB.DocumentClient();
}

Datastore.EVENT_TABLE_NAME = 'Event';
Datastore.NODE_TABLE_NAME = 'Node';
Datastore.TYPE_TEST_EVENT = 'test_event';
Datastore.TYPE_INITIALISE = 'initialise';
Datastore.TYPE_SHUTDOWN = 'shutdown';
Datastore.TYPE_TEMPERATURE_CHANGE = 'temperature_reading';
Datastore.TYPE_TEMPERATURE_SETTING_CHANGE = 'temperature_setting';
Datastore.TYPE_COOLING_RELAY_STATUS_CHANGE = 'cooling_relay_status_change';
Datastore.TYPE_HEATING_RELAY_STATUS_CHANGE = 'heating_relay_status_change';

Datastore.prototype.createEventTable = function createEventTable() {
    var params = {
        TableName : Datastore.EVENT_TABLE_NAME,
        KeySchema: [
            { AttributeName: "brewNodeUuid", KeyType: "HASH"},
            { AttributeName: "createdAt", KeyType: "RANGE"}
        ],
        AttributeDefinitions: [
            { AttributeName: "brewNodeUuid", AttributeType: "S" },
            { AttributeName: "createdAt", AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        }
    };

    this.dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
};

Datastore.prototype.putEvent = function putEvent(type, value) {

    var params = {
        TableName: Datastore.EVENT_TABLE_NAME,
        Item: {
            "uuid":  uuid(),
            "brewNodeUuid": this.config.brewNodeUuid,
            "type": type,
            "value": value,
            "createdAt": new Date().toISOString()
        }
    };

    this.docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to put event", params.Item.uuid, ". Error JSON:", JSON.stringify(err, null, 2));
        }
    });
};

Datastore.prototype.put = function put(table, attributes)
{
    attributes.createdAt = new Date().toISOString();

    if (typeof attributes.uuid === 'undefined') {
        attributes.uuid = uuid();
    }

    var params = {
        TableName: table,
        Item: attributes
    };

    this.docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to put item", attributes.uuid, ". Error JSON:", JSON.stringify(err, null, 2));
        }
    });

    return attributes;
};

Datastore.prototype.update = function update(table, attributes)
{
    if (typeof attributes.uuid === 'undefined') {
        console.error('Cannot update without UUID');
        return false;
    }

    var params = {
        TableName: table,
        Item: attributes
    };

    this.docClient.update(params, function(err, data) {
        if (err) {
            console.error("Unable to put item", attributes.uuid, ". Error JSON:", JSON.stringify(err, null, 2));
        }
    });

    return attributes;
};

module.exports = Datastore;
