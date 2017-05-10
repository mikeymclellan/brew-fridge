'use strict';

var Datastore = require('../daemon/datastore.js');

module.exports.put = (event, context, callback) => {

    var data = JSON.parse(event.body);
    var datastore = new Datastore({brewNodeUuid: data.brewNodeUuid});

    datastore.putEvent(data.type, data.value);

    const response = {
        statusCode: 200,
        body: JSON.stringify({ result: true })
    };

    callback(null, response);
};

