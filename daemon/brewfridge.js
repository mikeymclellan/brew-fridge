'use strict';

var onoff = require('onoff');
var ds18b20 = require('ds18b20');
var datastore = require('./datastore.js');
var Api = require('../lib/Api');
const TemperatureController = require('./TemperatureController');

class BrewFridge {

    constructor()
    {
        this.config = null;
        this.previousTemperatureReading = null;
        this.coolRelay = null;
        this.heatRelay = null;
        this.temperatureController = null;
    }

    initialise(process)
    {
        this.loadConfig(process.argv);

        this.api = new Api(null, this.config.lambdaBaseUrl || null);

        this.temperatureController = new TemperatureController({
            coolRelayGpio: this.config.coolRelayGpio,
            heatRelayGpio: this.config.heatRelayGpio,
            relayActiveValue: this.config.relayActiveValue,
            brewNodeUuid: this.config.brewNodeUuid,
            api: this.api});

        this.putEvent(datastore.TYPE_INITIALISE, 1);
        this.fetchNodeSettings();
        this.initialiseTemperatureSensors();

        process.on('SIGINT', () => {
            this.shutdown();
            process.exit();
        });
    }

    loadConfig(argv)
    {
        if (typeof argv[2] !== 'undefined') {
            this.config = require(process.argv[2]);
        } else {
            this.config = require('./config');
        }
    }

    initialiseTemperatureSensors()
    {
        ds18b20.sensors((err, ids) => {
            console.log('Found the following temperature sensors:');
            console.log(ids);
            if (this.config.temperatureSensorId) {
                console.log('Using \''+this.config.temperatureSensorId+'\' from config');
                this.temperatureSensorId = this.config.temperatureSensorId;
            } else {
                this.temperatureSensorId = ids[0];
                console.log('Using \''+this.temperatureSensorId+'\'');
            }
            ds18b20.temperature(this.temperatureSensorId, this.temperatureReadingCallback.bind(this));
        });
    }

    temperatureReadingCallback(err, currentTemperature)
    {
        this.temperatureController.setTemperatureReading(currentTemperature);
        ds18b20.temperature(this.temperatureSensorId, this.temperatureReadingCallback.bind(this));
    }

    shutdown()
    {
        this.putEvent(datastore.TYPE_SHUTDOWN, 1);
        this.temperatureController.shutdown();
        console.log('Bye, bye!');
    }

    fetchNodeSettings()
    {
        this.api.getNode(this.config.brewNodeUuid, (error, result) => {
            if (error) {
                return console.log('fetchNodeSettings error: ' + error);
            }
            this.temperatureController.setTargetTemperature(result.node.settings.targetTemperature);
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

module.exports = BrewFridge;
