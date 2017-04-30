var dateFormat = require('dateformat');
var onoff = require('onoff');
var ds18b20 = require('ds18b20');
var datastore = require('./datastore');

function BrewFridge(config) {
    this.config = config;
    this.db = new datastore(config);
    this.previousTemperatureReading = null;
    this.coolRelay = null;
    this.heatRelay = null;
}

/**
 * Temperature must change by at least this amount before it'll be logged
 * @type {number}
 */
BrewFridge.TEMPERATURE_LOGGING_HYSTERESIS = 0.2;
BrewFridge.CIRCUIT_COOLING = 'cooling';
BrewFridge.CIRCUIT_HEATING = 'heating';

BrewFridge.prototype.initialise = function BrewFridge_initialise(process)
{
    var self = this;
    this.coolRelay = new onoff.Gpio(this.config.coolRelayGpio, 'out');
    this.heatRelay = new onoff.Gpio(this.config.heatRelayGpio, 'out');

    this.db.putEvent(datastore.TYPE_INITIALISE, 1);

    ds18b20.sensors(function(err, ids) {
        console.log(ids);
        self.temperatureSensorId = ids[0];
        ds18b20.temperature(self.temperatureSensorId, self.temperatureReadingCallback.bind(self));
    });

    process.on('SIGINT', function () {
        self.shutdown();
        process.exit();
    });
};

BrewFridge.prototype.shutdown = function BrewFridge_shutdown()
{
    this.db.putEvent(datastore.TYPE_SHUTDOWN, 1);
    this.coolRelay.writeSync(0);
    this.coolRelay.unexport();
    this.heatRelay.writeSync(0);
    this.heatRelay.unexport();
    console.log('Bye, bye!');
};

BrewFridge.prototype.getOnTemperature = function BrewFridge_getOnTemperature($circuit) {
    if ($circuit === BrewFridge.CIRCUIT_COOLING) {
        return this.config.targetTemperature + (this.getCoolHysteresis()/2) + this.getCoolHysteresis();
    }
    return (this.config.targetTemperature - (this.getHeatHysteresis()/2)) - this.getHeatHysteresis();
};

BrewFridge.prototype.getOffTemperature = function BrewFridge_getOffTemperature($heatOrCool) {

    if ($heatOrCool === BrewFridge.CIRCUIT_COOLING) {
        return (this.config.targetTemperature + (this.getCoolHysteresis()/2)) - this.getCoolHysteresis();
    }
    return (this.config.targetTemperature - (this.getHeatHysteresis()/2)) + this.getHeatHysteresis();
};

BrewFridge.prototype.getCoolHysteresis = function BrewFridge_getCoolHysteresis() {
    return this.config.hysteresis;
};

BrewFridge.prototype.getHeatHysteresis = function BrewFridge_getHeatHysteresis() {
    return this.config.hysteresis;
};

BrewFridge.prototype.logTemerature = function BrewFridge_logTemerature(currentTemperature) {
    if (Math.abs(currentTemperature - this.previousTemperatureReading) >= BrewFridge.TEMPERATURE_LOGGING_HYSTERESIS) {
        this.db.putEvent(datastore.TYPE_TEMPERATURE_CHANGE, currentTemperature);
        this.previousTemperatureReading = currentTemperature;
    }
};

BrewFridge.prototype.temperatureReadingCallback = function BrewFridge_temperatureReadingCallback(err, currentTemperature) {

    this.logTemerature(currentTemperature);
    this.controlCooling(currentTemperature);
    this.controlHeating(currentTemperature);

    ds18b20.temperature(this.temperatureSensorId, this.temperatureReadingCallback.bind(this));
};

BrewFridge.prototype.controlCooling = function BrewFridge_controlCooling(currentTemperature) {
    var self = this;
    var now = new Date();
    now = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");

    var coolCurrentState = this.coolRelay.readSync();

    if (currentTemperature > this.getOnTemperature(BrewFridge.CIRCUIT_COOLING)
        && coolCurrentState != this.config.relayActiveValue)
    {
        this.coolRelay.write(this.config.relayActiveValue, function () {
            console.log(now + ' Turning cooling relay on. Temp is ' + currentTemperature);
            self.db.putEvent(datastore.TYPE_COOL_RELAY_STATUS_CHANGE, 1);
        });
    }
    else if (currentTemperature < this.getOffTemperature(BrewFridge.CIRCUIT_COOLING)
        && coolCurrentState === this.config.relayActiveValue)
    {
        this.coolRelay.write(coolCurrentState+1%2, function() {
            console.log(now + ' Turning cooling relay off. Temp is '+currentTemperature);
            self.db.putEvent(datastore.TYPE_COOL_RELAY_STATUS_CHANGE, 0);
        });
    }
};

BrewFridge.prototype.controlHeating = function BrewFridge_controlHeating(currentTemperature) {
    var self = this;
    var now = new Date();
    now = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");

    var heatCurrentState = this.heatRelay.readSync();

    if (currentTemperature < this.getOnTemperature(BrewFridge.CIRCUIT_HEATING)) {
        if (heatCurrentState != this.config.relayActiveValue) {
            this.heatRelay.write(this.config.relayActiveValue, function() {
                console.log(now + ' Turning heat relay on. Temp is ' + currentTemperature);
                self.db.putEvent(datastore.TYPE_HEAT_RELAY_STATUS_CHANGE, 1);
            });
        }
    } else if (heatCurrentState != this.config.relayActiveValue) {
        // Leaving relay off
    }
    else if (currentTemperature > this.getOffTemperature(BrewFridge.CIRCUIT_HEATING)) {

        this.heatRelay.write(heatCurrentState+1%2, function() {
            console.log(now + ' Turning heat relay off. Temp is '+currentTemperature);
            self.db.putEvent(datastore.TYPE_HEAT_RELAY_STATUS_CHANGE, 0);
        });
    }
};

module.exports = BrewFridge;


