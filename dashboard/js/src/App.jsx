var React = require('react');
var EventChart = React.createFactory(require('./components/EventChart.jsx'));
var TemperatureReading = React.createFactory(require('./components/TemperatureReading.jsx'));
var TemperatureSetting = React.createFactory(require('./components/TemperatureSetting.jsx'));

module.exports =
    React.createClass({
        render: function() {
            return (
                <div>
                    <EventChart />
                    <TemperatureReading temperature={this.props.nodeData.currentTemperature} />
                    <TemperatureSetting temperature={this.props.nodeData.targetTemperature} isEnabled={this.props.nodeData.isEnabled} />
                </div>
            );
        }
    });
