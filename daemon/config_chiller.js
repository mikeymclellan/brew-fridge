const minute = 60 * 1000;

module.exports = {
    hysteresis: 0.25,
    sampleRate: minute, //sample rate in mS
    logRate: minute, //log rate in mS
    relayOnDelay: minute, //Wait time before turning relay on again from the last time it was turned on
    ds18b20Id: null, // leave null to auto-detect
    relayActiveValue: 0,  // 0 == active low
    brewNodeUuid: '8ca5ca7e-7344-42d5-8b8c-004edc688d48',
    lambdaBaseUrl: 'https://m6tkeez3mk.execute-api.ap-southeast-2.amazonaws.com/dev',
    temperatureSensorId: '28-000006455593',
    aws: {
        region: 'ap-southeast-2',
        key:    null, // Only used if set, otherwise will pull from aws credentials files
        secret: null  // Only used if set, otherwise will pull from aws credentials files
    }
};
