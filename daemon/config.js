const minute = 60 * 1000;

const config = {
    targetTemperature: 4,
    sampleRate: minute , //sample rate in mS
    graphRate: minute, //graphing rate in mS
    relayGpio: 14,
    relayOnDelay: minute, //Wait time before turning relay on again from the last time it was turned on
    ds18b20Id: '28-011600ad7aff'
};

module.exports = function() {
    return config;
};
