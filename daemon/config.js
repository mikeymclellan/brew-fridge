const minute = 60 * 1000;

const config = {
    targetTemperature: 4,
    hysteresis: 1,
    sampleRate: minute, //sample rate in mS
    graphRate: minute, //graphing rate in mS
    relayGpio: 15,
    relayOnDelay: minute, //Wait time before turning relay on again from the last time it was turned on
    ds18b20Id: '28-011600ad7aff',
    relayActiveValue: 0  // 0 == active low
};

module.exports = function() {
    return config;
};
