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

        this.setRelayState(this.coolRelay, false, false);
        this.setRelayState(this.heatRelay, false, false);
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
        this.setRelayState(this.coolRelay, false, false);
        this.setRelayState(this.heatRelay, false, false);
        this.coolRelay.unexport();
        this.heatRelay.unexport();
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
        return this.config.hysteresis * 2;
    }

    /**
     * @todo Make adaptive
     * @returns {number}
     */
    getCoolHysteresis()
    {
        return this.config.hysteresis;
    }

    /**
     * @todo Make adaptive
     * @returns {number}
     */
    getHeatHysteresis()
    {
        return this.config.hysteresis;
    }

    logTemerature(currentTemperature, force = false)
    {
        if (Math.abs(currentTemperature - this.previousTemperatureReading) >= BrewFridge.TEMPERATURE_LOGGING_HYSTERESIS || force) {
            this.db.putEvent(datastore.TYPE_TEMPERATURE_CHANGE, currentTemperature);
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
            self.db.putEvent(eventType, isActiveState);
            if (currentTemperature !== false) {
                self.db.putEvent(datastore.TYPE_TEMPERATURE_CHANGE, currentTemperature);
            }
        });
    }

    isRelayOn(relay)
    {
        return relay.readSync() === this.config.relayActiveValue;
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
        var isHeating = this.isRelayOn(this.heatRelay);

        if (currentTemperature < this.getOnTemperature(BrewFridge.CIRCUIT_HEATING) && !isHeating) {
            this.setRelayState(this.heatRelay, true, currentTemperature);
        }
        else if (currentTemperature > this.getOffTemperature(BrewFridge.CIRCUIT_HEATING) && isHeating)
        {
            this.setRelayState(this.heatRelay, false, currentTemperature);
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
