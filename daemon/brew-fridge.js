var onoff = require('onoff');
var ds18b20 = require('ds18b20');

var daemon = this;

daemon.config = require('./config')();
console.log(daemon.config);

ds18b20.sensors(function(err, ids) {
    console.log(ids);
});


var relay = new onoff.Gpio(daemon.relayGpio, 'out'),
    interval;

interval = setInterval(function () {
    var value = (relay.readSync() + 1) % 2;
    relay.write(value, function() {
        console.log("Changed LED state to: " + value);
    });
}, daemon.config.sampleRate);

process.on('SIGINT', function () {
    clearInterval(interval);
    relay1.writeSync(0);
    relay1.unexport();
    console.log('Bye, bye!');
    process.exit();
});