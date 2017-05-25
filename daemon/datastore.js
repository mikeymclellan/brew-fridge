
function Datastore(config) {
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

module.exports = Datastore;
