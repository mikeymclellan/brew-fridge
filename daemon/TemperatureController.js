'use strict';

var dateFormat = require('dateformat');
var datastore = require('./datastore.js');
var Api = require('../lib/Api');

/**
 * Temperature must change by at least this amount before it'll be logged
 * @type {number}
 */
const TEMPERATURE_LOGGING_HYSTERESIS = 0.2;
const DEFAULT_HYSTERESIS = 0.25;
const ACTIVE_LOW = 0;
const CIRCUIT_COOLING = 'cooling';
const CIRCUIT_HEATING = 'heating';

class TemperatureController {

    constructor(config)
    {
        this.targetTemperature = null;
        this.previousTemperatureReading = null;
        this.coolRelay = null;
        this.heatRelay = null;
        this.heatRelayGpio    = config.heatRelayGpio || null;
        this.coolRelayGpio    = config.coolRelayGpio || null;
        this.api              = config.api || null;
        this.hysteresis       = config.hysteresis || DEFAULT_HYSTERESIS;
        this.relayActiveValue = config.relayActiveValue || ACTIVE_LOW;
        this.brewNodeUuid     = config.brewNodeUuid || null;

        this.initialiseTemperatureControlRelays();
    }

    shutdown()
    {
        if (this.coolRelay) {
            this.setRelayState(this.coolRelay, false, false);
            this.coolRelay.unexport();
        }
        if (this.heatRelay) {
            this.setRelayState(this.heatRelay, false, false);
            this.heatRelay.unexport();
        }
    }

    initialiseTemperatureControlRelays()
    {
        if (this.coolRelayGpio) {
            const onoff = require('onoff');
            this.coolRelay = new onoff.Gpio(this.coolRelayGpio, 'out');
            this.setRelayState(this.coolRelay, false, false);
        }

        if (this.heatRelayGpio) {
            const onoff = require('onoff');
            this.heatRelay = new onoff.Gpio(this.heatRelayGpio, 'out');
            this.setRelayState(this.heatRelay, false, false);
        }
    }

    setTemperatureReading(currentTemperature)
    {
        this.logTemperature(currentTemperature);
        this.controlCooling(currentTemperature);
        this.controlHeating(currentTemperature);
    }

    setTargetTemperature(temperature)
    {
        this.targetTemperature = temperature;
    }

    getOnTemperature(circuit)
    {
        if (circuit === CIRCUIT_COOLING) {
            return this.targetTemperature + this.getHeatingCoolingTemperatureBuffer() + this.getCoolHysteresis();
        }
        return (this.targetTemperature - this.getHeatingCoolingTemperatureBuffer()) - this.getHeatHysteresis();
    };

    getOffTemperature(heatOrCool)
    {
        if (heatOrCool === CIRCUIT_COOLING) {
            return (this.targetTemperature + this.getHeatingCoolingTemperatureBuffer()) - this.getCoolHysteresis();
        }
        return (this.targetTemperature - this.getHeatingCoolingTemperatureBuffer()) + this.getHeatHysteresis();
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
        if (this.targetTemperature < 8) {
            // Temporary hack to keep duty cycle sane at lower temps
            return 0.7;
        }
        return this.hysteresis;
    }

    /**
     * @todo Make adaptive
     * @returns {number}
     */
    getHeatHysteresis()
    {
        return this.hysteresis;
    }

    logTemperature(currentTemperature, force = false)
    {
        if (Math.abs(currentTemperature - this.previousTemperatureReading) >= TEMPERATURE_LOGGING_HYSTERESIS || force) {
            this.putEvent(datastore.TYPE_TEMPERATURE_CHANGE, currentTemperature);
            this.previousTemperatureReading = currentTemperature;
        }
    }

    setRelayState(relay, isActiveState, currentTemperature)
    {
        var self = this;
        var now = new Date();
        now = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");

        var writeValue = isActiveState?this.relayActiveValue:this.relayActiveValue+1%2;

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
        return relay.readSync() === this.relayActiveValue;
    }

    controlCooling(currentTemperature)
    {
        if (!this.coolRelay) {
            return;
        }
        var isCooling = this.isRelayOn(this.coolRelay);

        if (currentTemperature > this.getOnTemperature(CIRCUIT_COOLING) && !isCooling)
        {
            this.setRelayState(this.coolRelay, true, currentTemperature);
        }
        else if (currentTemperature < this.getOffTemperature(CIRCUIT_COOLING) && isCooling)
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

        if (currentTemperature < this.getOnTemperature(CIRCUIT_HEATING) && !isHeating) {
            this.setRelayState(this.heatRelay, true, currentTemperature);
        }
        else if (currentTemperature > this.getOffTemperature(CIRCUIT_HEATING) && isHeating)
        {
            this.setRelayState(this.heatRelay, false, currentTemperature);
        }
    }

    putEvent(type, value)
    {
        this.api.putEvent(this.brewNodeUuid, type, value, (error, result) => {
            if (error) {
                console.log('putEvent() failed', error);
            }
        });
    }
}

module.exports = TemperatureController;
