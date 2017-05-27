const minute = 60 * 1000;

module.exports = {
    targetTemperature: 21,
    hysteresis: 0.25,
    sampleRate: minute, //sample rate in mS
    logRate: minute, //log rate in mS
    heatRelayGpio: 2,
    coolRelayGpio: 15,
    relayOnDelay: minute, //Wait time before turning relay on again from the last time it was turned on
    ds18b20Id: null, // leave null to auto-detect
    relayActiveValue: 0,  // 0 == active low
    brewNodeUuid: 'b1f85ed9-78a7-40e0-b695-be3c0fd8a95b',
    lambdaBaseUrl: 'https://m6tkeez3mk.execute-api.ap-southeast-2.amazonaws.com/dev',
    temperatureSensorId: '28-011600ad7aff',
    aws: {
        region: 'ap-southeast-2',
        key:    null, // Only used if set, otherwise will pull from aws credentials files
        secret: null  // Only used if set, otherwise will pull from aws credentials files
    }
};
