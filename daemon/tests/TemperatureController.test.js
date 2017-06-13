const TemperatureController = require('../TemperatureController');

const tc = new TemperatureController({
    coolRelayGpio: 0,
    heatRelayGpio: null,
    relayActiveValue: 0,
    api: null});

test('construtor sets gpio', () => {
    expect(tc.coolRelayGpio).toBe(null);
});
