'use strict';

var dateFormat = require('dateformat');
var onoff = require('onoff');
var ds18b20 = require('ds18b20');
var datastore = require('./datastore');

class BrewFridge {

    constructor(config)
    {
        this.config = config;
        this.db = new datastore(config);
        this.previousTemperatureReading = null;
        this.coolRelay = null;
        this.heatRelay = null;
    }

    initialise(process)
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
    }

    shutdown()
    {
        this.db.putEvent(datastore.TYPE_SHUTDOWN, 1);
        this.coolRelay.writeSync(this.config.relayActiveValue+1%2);
        this.coolRelay.unexport();
        this.heatRelay.writeSync(this.config.relayActiveValue+1%2);
        this.heatRelay.unexport();
        console.log('Bye, bye!');
    }

    getOnTemperature(circuit)
    {
        if (circuit === BrewFridge.CIRCUIT_COOLING) {
            return this.config.targetTemperature + (this.getCoolHysteresis()/2) + this.getCoolHysteresis();
        }
        return (this.config.targetTemperature - (this.getHeatHysteresis()/2)) - this.getHeatHysteresis();
    };

    getOffTemperature(heatOrCool)
    {
        if (heatOrCool === BrewFridge.CIRCUIT_COOLING) {
            return (this.config.targetTemperature + (this.getCoolHysteresis()/2)) - this.getCoolHysteresis();
        }
        return (this.config.targetTemperature - (this.getHeatHysteresis()/2)) + this.getHeatHysteresis();
    }

    getCoolHysteresis()
    {
        return this.config.hysteresis;
    }

    getHeatHysteresis()
    {
        return this.config.hysteresis;
    }

    logTemerature(currentTemperature)
    {
        if (Math.abs(currentTemperature - this.previousTemperatureReading) >= BrewFridge.TEMPERATURE_LOGGING_HYSTERESIS) {
            this.db.putEvent(datastore.TYPE_TEMPERATURE_CHANGE, currentTemperature);
            this.previousTemperatureReading = currentTemperature;
        }
    }

    temperatureReadingCallback(err, currentTemperature)
    {
        this.logTemerature(currentTemperature);
        this.controlCooling(currentTemperature);
        this.controlHeating(currentTemperature);

        ds18b20.temperature(this.temperatureSensorId, this.temperatureReadingCallback.bind(this));
    }

    controlCooling(currentTemperature)
    {
        var self = this;
        var now = new Date();
        now = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");

        var coolCurrentState = this.coolRelay.readSync();

        if (currentTemperature > this.getOnTemperature(BrewFridge.CIRCUIT_COOLING)
            && coolCurrentState != this.config.relayActiveValue)
        {
            this.coolRelay.write(this.config.relayActiveValue, function () {
                console.log(now + ' Turning cooling relay on. Temp is ' + currentTemperature);
                self.db.putEvent(datastore.TYPE_COOLING_RELAY_STATUS_CHANGE, 1);
            });
        }
        else if (currentTemperature < this.getOffTemperature(BrewFridge.CIRCUIT_COOLING)
            && coolCurrentState === this.config.relayActiveValue)
        {
            this.coolRelay.write(coolCurrentState+1%2, function() {
                console.log(now + ' Turning cooling relay off. Temp is '+currentTemperature);
                self.db.putEvent(datastore.TYPE_COOLING_RELAY_STATUS_CHANGE, 0);
            });
        }
    }

    controlHeating(currentTemperature)
    {
        var self = this;
        var now = new Date();
        now = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");

        var heatCurrentState = this.heatRelay.readSync();

        if (currentTemperature < this.getOnTemperature(BrewFridge.CIRCUIT_HEATING)) {
            if (heatCurrentState != this.config.relayActiveValue) {
                this.heatRelay.write(this.config.relayActiveValue, function() {
                    console.log(now + ' Turning heating relay on. Temp is ' + currentTemperature);
                    self.db.putEvent(datastore.TYPE_HEATING_RELAY_STATUS_CHANGE, 1);
                });
            }
        }
        else if (currentTemperature > this.getOffTemperature(BrewFridge.CIRCUIT_HEATING)
            && heatCurrentState === this.config.relayActiveValue)
        {
            this.heatRelay.write(heatCurrentState+1%2, function() {
                console.log(now + ' Turning heating relay off. Temp is '+currentTemperature);
                self.db.putEvent(datastore.TYPE_HEATING_RELAY_STATUS_CHANGE, 0);
            });
        }
    }
}

/**
 * Temperature must change by at least this amount before it'll be logged
 * @type {number}
 */
BrewFridge.TEMPERATURE_LOGGING_HYSTERESIS = 0.2;
BrewFridge.CIRCUIT_COOLING = 'cooling';
BrewFridge.CIRCUIT_HEATING = 'heating';

module.exports = BrewFridge;
