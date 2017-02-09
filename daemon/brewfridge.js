var dateFormat = require('dateformat');
var onoff = require('onoff');
var ds18b20 = require('ds18b20');
var datastore = require('./datastore');

function BrewFridge(config) {
    this.config = config;
    this.db = new datastore(config);
    this.previousTemperatureReading = null;
    this.relay = null;
}

BrewFridge.prototype.initialise = function BrewFridge_initialise(process)
{
    this.relay = new onoff.Gpio(this.config.relayGpio, 'out');

    this.db.putEvent(datastore.TYPE_INITIALISE, 1);

    ds18b20.sensors(function(err, ids) {
        console.log(ids);
        this.temperatureSensorId = ids[0];
        ds18b20.temperature(this.temperatureSensorId, this.temperatureReadingCallback);
    });

    process.on('SIGINT', function () {
        this.shutdown();
        process.exit();
    });
};

BrewFridge.prototype.shutdown = function BrewFridge_shutdown()
{
    this.db.putEvent(datastore.TYPE_SHUTDOWN, 1);
    this.relay.writeSync(0);
    this.relay.unexport();
    console.log('Bye, bye!');
};

BrewFridge.prototype.temperatureReadingCallback = function BrewFridge_temperatureReadingCallback(err, value) {

    var that = this;
    var now = new Date();
    now = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");

    if (value != this.previousTemperatureReading) {
        this.db.putEvent(datastore.TYPE_TEMPERATURE_CHANGE, value);
        this.previousTemperatureReading = value;
    }

    var currentState = relay.readSync();

    if (value > this.config.targetTemperature) {
        if (currentState == this.config.relayActiveValue) {
            this.relay.write(this.config.relayActiveValue, function() {
                //console.log('Leaving relay on');
            });
        } else {
            this.relay.write(this.config.relayActiveValue, function() {
                console.log(now + ' Turning relay on. Temp is ' + value);
                that.db.putEvent(datastore.TYPE_RELAY_STATUS_CHANGE, 1);
            });
        }
    } else if (currentState != this.config.relayActiveValue) {
        //console.log('Leaving relay off');
    } 
    else if (value < this.config.targetTemperature - this.config.hysteresis) {

        this.relay.write(currentState+1%2, function() {
            console.log(now + ' Turning relay off. Temp is '+value);
            that.db.putEvent(datastore.TYPE_RELAY_STATUS_CHANGE, 0);
        });
    } else {
        //console.log('Under temp but within hysteresis, leaving on');
    }

    ds18b20.temperature(this.temperatureSensorId, this.temperatureReadingCallback);
};

module.exports = BrewFridge;


