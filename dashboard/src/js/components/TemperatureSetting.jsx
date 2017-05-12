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
                <button type="button" className="btn btn-default" onClick={() => this.incrementTemperature()}><i className="material-icons">keyboard_arrow_up</i></button>
                <button type="button" className="btn btn-default" onClick={() => this.decrementTemperature()}><i className="material-icons">keyboard_arrow_down</i></button>
                <button type="button" className="btn btn-default" onClick={() => this.turnOff()}><i className="material-icons">power_settings_new</i></button>
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

