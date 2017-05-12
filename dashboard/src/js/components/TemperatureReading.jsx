var React = require('react');

class TemperatureReading extends React.Component {
    render()
    {
        return (
            <div>
                {this.props.temperature}&deg;
            </div>
        );
    }
}
module.exports = TemperatureReading;
