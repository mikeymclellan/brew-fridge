#IoT Brew Fridge

## Goal

Build an IoT brew fridge as cheaply as possible using [serverless computing](https://en.wikipedia.org/wiki/Serverless_computing).

## Architecture

Raspberry Pi acts as IoT device running the [AWS IoT Node.js library](https://github.com/aws/aws-iot-device-sdk-js/blob/master/README.md). Temperature readings are published to AWS and recorded in DynamoDB. IoT messages sent to brew-fridge to set desired temperature. AWS Lambda function subscribed to temperature readings and updates temp over time to match desired temperature profile.

## Components

- [4 channel relay module](http://www.hotmcu.com/4channel-relay-module10a-p-280.html) $10
- 2 x [DS18B20 temperature sensors](http://datasheets.maximintegrated.com/en/ds/DS18B20.pdf) $9
- Frigidaire FP120 Fridge - Literally found dumped in some bushes - Free
- Fermenting barrel - Bob gave it to me - Free
- Raspberry Pi - From the electronics bin - Free

## Schematic

![Schematic](images/schematic.png)

## Developing

You can use the webpack development server by running:

    node_modules/.bin/webpack-dev-server --open
    
## Deploy

    grunt deploy
    
## Deploy Lambda
    serverless deploy

## References

- [Quick start using 1-wire temp sensors](https://learn.adafruit.com/adafruits-raspberry-pi-lesson-11-ds18b20-temperature-sensing/ds18b20)
- [Node.js GPIO](https://www.sitepoint.com/getting-started-with-the-raspberry-pi-gpio-pins-in-node-js/)
- [AWS Serverless apps with Node.js](https://blog.fugue.co/2016-05-05-architecting-a-serverless-web-application-in-aws.html)
- [Node.js DynamoDB ORM](https://github.com/clarkie/dynogels)
- [Redux with React](http://redux.js.org/docs/basics/UsageWithReact.htmlimmortal)
- [React & Backbone](https://blog.engineyard.com/2015/integrating-react-with-backbone)

![Fridge](images/found-fridge.jpg)

