var dateFormat = require('dateformat');
var onoff = require('onoff');
var ds18b20 = require('ds18b20');
var dynamodb = require('./dynamo-db');

var daemon = this,
    temperatureSensorId,
    relay;

daemon.config = require('./config')();

relay = new onoff.Gpio(daemon.config.relayGpio, 'out');

var temperatureCallback = function (err, value) {


    var now = new Date();
    now = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");

    //console.log(now + ' Current temperature is', value);
    var currentState = relay.readSync();

    if (value > daemon.config.targetTemperature) {
        if (currentState == daemon.config.relayActiveValue) {
            relay.write(daemon.config.relayActiveValue, function() {
                //console.log('Leaving relay on');
            });
        } else {
            relay.write(daemon.config.relayActiveValue, function() {
                console.log(now + ' Turning relay on. Temp is ' + value);
            });
        }
    } else if (currentState != daemon.config.relayActiveValue) {
        //console.log('Leaving relay off');
    } 
    else if (value < daemon.config.targetTemperature - daemon.config.hysteresis) {

        relay.write(currentState+1%2, function() {
            console.log(now + ' Turning relay off. Temp is '+value);
        });
    } else {
        //console.log('Under temp but within hysteresis, leaving on');
    }

    ds18b20.temperature(temperatureSensorId, temperatureCallback);
};

ds18b20.sensors(function(err, ids) {
    console.log(ids);
    temperatureSensorId = ids[0];
    ds18b20.temperature(temperatureSensorId, temperatureCallback);
});

process.on('SIGINT', function () {
    relay.writeSync(0);
    relay.unexport();
    console.log('Bye, bye!');
    process.exit();
});
