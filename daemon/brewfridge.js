'use strict';

var dateFormat = require('dateformat');
var onoff = require('onoff');
var ds18b20 = require('ds18b20');
var datastore = require('./datastore.js');

var Api = require('../lib/Api');

class BrewFridge {

    constructor()
    {
        this.config = null;
        this.previousTemperatureReading = null;
        this.coolRelay = null;
        this.heatRelay = null;
        this.DEFAULT_HYSTERESIS = 0.25;
    }

    initialise(process)
    {
        var self = this;

        if (typeof process.argv[2] !== 'undefined') {
            this.config = require(process.argv[2]);
        } else {
            this.config = require('./config');
        }

        this.api = new Api(null, this.config.lambdaBaseUrl || null);

        if (this.config.coolRelayGpio) {
            this.coolRelay = new onoff.Gpio(this.config.coolRelayGpio, 'out');
            this.setRelayState(this.coolRelay, false, false);
        }

        if (this.config.heatRelayGpio) {
            this.heatRelay = new onoff.Gpio(this.config.heatRelayGpio, 'out');
            this.setRelayState(this.heatRelay, false, false);
        }

        this.putEvent(datastore.TYPE_INITIALISE, 1);
        this.fetchNodeSettings();

        ds18b20.sensors(function(err, ids) {
            console.log('Found the following temperature sensors:');
            console.log(ids);
            if (self.config.temperatureSensorId) {
                console.log('Using \''+self.config.temperatureSensorId+'\' from config');
                self.temperatureSensorId = self.config.temperatureSensorId;
            } else {
                self.temperatureSensorId = ids[0];
                console.log('Using \''+self.temperatureSensorId+'\'');
            }
            ds18b20.temperature(self.temperatureSensorId, self.temperatureReadingCallback.bind(self));
        });

        process.on('SIGINT', function () {
            self.shutdown();
            process.exit();
        });
    }

    shutdown()
    {
        this.putEvent(datastore.TYPE_SHUTDOWN, 1);
        if (this.coolRelay) {
            this.setRelayState(this.coolRelay, false, false);
            this.coolRelay.unexport();
        }
        if (this.heatRelay) {
            this.setRelayState(this.heatRelay, false, false);
            this.heatRelay.unexport();
        }
        console.log('Bye, bye!');
    }

    getOnTemperature(circuit)
    {
        if (circuit === BrewFridge.CIRCUIT_COOLING) {
            return this.config.targetTemperature + this.getHeatingCoolingTemperatureBuffer() + this.getCoolHysteresis();
        }
        return (this.config.targetTemperature - this.getHeatingCoolingTemperatureBuffer()) - this.getHeatHysteresis();
    };

    getOffTemperature(heatOrCool)
    {
        if (heatOrCool === BrewFridge.CIRCUIT_COOLING) {
            return (this.config.targetTemperature + this.getHeatingCoolingTemperatureBuffer()) - this.getCoolHysteresis();
        }
        return (this.config.targetTemperature - this.getHeatingCoolingTemperatureBuffer()) + this.getHeatHysteresis();
    }

    /**
     * @todo Make adaptive
     * @returns {number}
     */
    getHeatingCoolingTemperatureBuffer()
    {
        return this.getCoolHysteresis() * 2;
    }

    /**
     * @todo Make adaptive
     * @returns {number}
     */
    getCoolHysteresis()
    {
        return this.config.hysteresis || this.DEFAULT_HYSTERESIS;
    }

    /**
     * @todo Make adaptive
     * @returns {number}
     */
    getHeatHysteresis()
    {
        return this.config.hysteresis || this.DEFAULT_HYSTERESIS;
    }

    logTemperature(currentTemperature, force = false)
    {
        if (Math.abs(currentTemperature - this.previousTemperatureReading) >= BrewFridge.TEMPERATURE_LOGGING_HYSTERESIS || force) {
            this.putEvent(datastore.TYPE_TEMPERATURE_CHANGE, currentTemperature);
            this.previousTemperatureReading = currentTemperature;
        }
    }

    setRelayState(relay, isActiveState, currentTemperature)
    {
        var self = this;
        var now = new Date();
        now = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");

        var writeValue = isActiveState?this.config.relayActiveValue:this.config.relayActiveValue+1%2;

        var eventType = relay === this.coolRelay?datastore.TYPE_COOLING_RELAY_STATUS_CHANGE:datastore.TYPE_HEATING_RELAY_STATUS_CHANGE;

        relay.write(writeValue, function () {
            console.log(now + ' ' + eventType + ' => ' + isActiveState + '. Temp is ' + currentTemperature);
            self.putEvent(eventType, isActiveState);
            if (currentTemperature !== false) {
                self.putEvent(datastore.TYPE_TEMPERATURE_CHANGE, currentTemperature);
            }
        });
    }

    isRelayOn(relay)
    {
        return relay.readSync() === this.config.relayActiveValue;
    }

    temperatureReadingCallback(err, currentTemperature)
    {
        this.logTemperature(currentTemperature);
        this.controlCooling(currentTemperature);
        this.controlHeating(currentTemperature);

        ds18b20.temperature(this.temperatureSensorId, this.temperatureReadingCallback.bind(this));
    }

    controlCooling(currentTemperature)
    {
        if (!this.coolRelay) {
            return;
        }
        var isCooling = this.isRelayOn(this.coolRelay);

        if (currentTemperature > this.getOnTemperature(BrewFridge.CIRCUIT_COOLING) && !isCooling)
        {
            this.setRelayState(this.coolRelay, true, currentTemperature);
        }
        else if (currentTemperature < this.getOffTemperature(BrewFridge.CIRCUIT_COOLING) && isCooling)
        {
            this.setRelayState(this.coolRelay, false, currentTemperature);
        }
    }

    controlHeating(currentTemperature)
    {
        if (!this.heatRelay) {
            return;
        }
        var isHeating = this.isRelayOn(this.heatRelay);

        if (currentTemperature < this.getOnTemperature(BrewFridge.CIRCUIT_HEATING) && !isHeating) {
            this.setRelayState(this.heatRelay, true, currentTemperature);
        }
        else if (currentTemperature > this.getOffTemperature(BrewFridge.CIRCUIT_HEATING) && isHeating)
        {
            this.setRelayState(this.heatRelay, false, currentTemperature);
        }
    }

    fetchNodeSettings()
    {
        this.api.getNode(this.config.brewNodeUuid, (error, result) => {
            if (error) {
                return console.log('fetchNodeSettings error: ' + error);
            }
            this.config.targetTemperature = result.node.settings.targetTemperature;
        });

        setTimeout(() => {this.fetchNodeSettings()}, 30000);
    }

    putEvent(type, value)
    {
        this.api.putEvent(this.config.brewNodeUuid, type, value, (error, result) => {
            if (error) {
                console.log('putEvent() failed', error);
            }
        });
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
