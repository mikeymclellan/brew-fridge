var dateFormat = require('dateformat');
var dynamodb = require('./dynamo-db');
var datastore = require('./dynamo-db');
var config = require('./config')();

var db = new datastore(config);

// db.createEventTable();
db.putEvent(datastore.TYPE_TEST_EVENT, 2);