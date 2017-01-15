var onoff = require('onoff');

var relay1 = new onoff.Gpio(14, 'out'),
    interval;

interval = setInterval(function () {
    var value = (relay1.readSync() + 1) % 2;
    relay1.write(value, function() {
        console.log("Changed LED state to: " + value);
    });
}, 2000);

process.on('SIGINT', function () {
    clearInterval(interval);
    relay1.writeSync(0);
    relay1.unexport();
    console.log('Bye, bye!');
    process.exit();
});