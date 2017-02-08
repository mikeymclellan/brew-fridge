const AWS = require("aws-sdk");
const uuid = require('uuid/v4');


function Datastore(config) {
    AWS.config.update({
        region: config.aws.region,
        accessKeyId: config.aws.key,
        secretAccessKey: config.aws.secret
    });

    this.config = config;
    this.dynamodb = new AWS.DynamoDB();
    this.docClient = new AWS.DynamoDB.DocumentClient();

}

Datastore.EVENT_TABLE_NAME = 'Event';
Datastore.TYPE_TEST_EVENT = 'test_event';
Datastore.TYPE_INITIALISE = 'initialise';
Datastore.TYPE_TEMPERATURE_CHANGE = 'temperature_reading';
Datastore.TYPE_RELAY_STATUS_CHANGE = 'relay_status_change';

Datastore.prototype.createEventTable = function createEventTable() {
    var params = {
        TableName : Datastore.EVENT_TABLE_NAME,
        KeySchema: [
            { AttributeName: "uuid", KeyType: "HASH"},
            { AttributeName: "brewNodeUuid", KeyType: "RANGE"}
        ],
        AttributeDefinitions: [
            { AttributeName: "uuid", AttributeType: "S" },
            { AttributeName: "brewNodeUuid", AttributeType: "S" }
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
}

module.exports = Datastore;
