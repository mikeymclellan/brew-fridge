var React = require('react');

class TemperatureSetting extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            temperature: props.temperature,
            isEnabled: true
        };
    }

    render() {
        return (
            <div>
                {this.state.temperature}&deg;
                <button type="button" className="btn btn-default" onClick={() => this.incrementTemperature()}><span className="glyphicon glyphicon glyphicon-menu-up" aria-hidden="true"></span></button>
                <button type="button" className="btn btn-default" onClick={() => this.decrementTemperature()}><span className="glyphicon glyphicon glyphicon-menu-down" aria-hidden="true"></span></button>
                <button type="button" className="btn btn-default" onClick={() => this.turnOff()}><span className="glyphicon glyphicon glyphicon-off" aria-hidden="true"></span></button>
            </div>
        );
    }

    incrementTemperature() {
        this.setState({temperature: this.state.temperature+1});
        this.nodeUpdateSettings({targetTemperature: this.state.temperature+1});
    }

    decrementTemperature() {
        this.setState({temperature: this.state.temperature-1});
        this.nodeUpdateSettings({targetTemperature: this.state.temperature-1});
    }

    nodeUpdateSettings(partialSettings) {
        fetch(this.props.baseUrl + '/node/' + this.props.brewNodeUuid + '/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(partialSettings)
        });
    }

    turnOff() {
    }
}

module.exports = TemperatureSetting;

