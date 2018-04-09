'use strict';

const ds18b20 = require('ds18b20');
const datastore = require('./datastore.js');
const Api = require('../lib/Api');
const TemperatureController = require('./TemperatureController');
const fs = require('fs');

const DASHBOARD_URL = 'http://brewfridge.mclellan.org.nz/';
const CONFIG_PATH = require('os').homedir()+'/.brewfridge';

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
        this.loadConfig(process, (error) => {
            if (error) {
                process.exit(-1);
            }
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
        });
    }

    getDefaultConfig()
    {
        return {
            targetTemperature: null,
            heatRelayGpio: null,
            coolRelayGpio: null,
            relayActiveValue: 0,  // 0 == active low
            brewNodeUuid: null,
            temperatureSensorId: null
        };
    }

    registerNewNode(callback)
    {
        this.api = new Api(); // Have to bootstrap the API without any config, will use defaults
        this.api.registerNode((error, result) => {
            if (error) {
                console.log('registerNode() failed', error);
                callback(error);
            }
            this.config = this.getDefaultConfig();
            this.config.brewNodeUuid = result.uuid;

            fs.mkdir(CONFIG_PATH, 0o755, (err) => {
                if (err && err.code !== 'EEXIST') {
                    console.log(err);
                    return;
                }
                fs.writeFile(CONFIG_PATH+'/config.js', 'module.exports = ' + JSON.stringify(this.config)+';', (err) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log('Registered new node, go to '+DASHBOARD_URL+'/node/claim/'+result.uuid);
                    callback(err, this.config);
                });
            });
        });
    }

    loadConfig(process, callback)
    {
        if (typeof process.argv[2] !== 'undefined') {
            try {
                this.config = require(process.argv[2]);
                callback();
            } catch (e) {
                console.log('Couldn\'t load config file ' + process.argv[2]);
                callback(e.message);
            }
            return;
        }
        try {
            this.config = require(CONFIG_PATH+'/config.js');
            callback();
        } catch (e) {
            console.log('No config found, will register as a new node');
            this.registerNewNode(callback);
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
