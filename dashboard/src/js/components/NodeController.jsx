import React, { PropTypes, Component } from 'react';
import ReactBootstrapSlider from 'react-bootstrap-slider';
var EventChart = React.createFactory(require('./EventChart.jsx'));

class NodeController extends Component {

    propTypes: {
        brewNodeUuid: PropTypes.string.isRequired,
        googleUser: PropTypes.object.isRequired,
        baseUrl: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            targetTemperature: null,
            isEnabled: true,
            node: null,
            isLoading: true,
        };
    }

    componentDidMount() {

        fetch(this.props.baseUrl + '/node/' + this.props.brewNodeUuid)
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                this.setState({node: json.node
                    , isLoading: false
                    , targetTemperature: json.node.settings.targetTemperature
                });
            })
            .catch((exception) => {
                console.log('parsing failed', exception)
            });
    }

    render() {
        if (this.state.isLoading) {
            return (
                <div>Loading...</div>
            );
        }

        return (
            <div className="well brew-node col-md-3">
                <h1 className="current-temperature">{this.state.node.currentTemperature}&deg;
                    <button type="button" className="btn btn-default" onClick={() => this.turnOff()}><i className="material-icons">power_settings_new</i></button>
                </h1>
                <div className="target">Target {this.state.targetTemperature}&deg;</div>
                <ReactBootstrapSlider
                    className="slider"
                    value={parseInt(this.state.targetTemperature)}
                    min={0}
                    max={30}
                    change={(e) => {this.temperatureChangeHandler(e)}}
                    slideStop={(e) => {this.temperatureStopHandler(e)}}
                    tooltip="hide"
                ></ReactBootstrapSlider>
                <EventChart />
            </div>
        );
    }

    temperatureStopHandler(event) {
        this.setState({targetTemperature: event.target.value});
        this.nodeUpdateSettings({targetTemperature: this.state.targetTemperature});
    }

    temperatureChangeHandler(event) {
        this.setState({targetTemperature: event.target.value});
    }

    nodeUpdateSettings(partialSettings) {
        fetch(this.props.baseUrl + '/node/' + this.props.brewNodeUuid + '/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.props.googleUser.getAuthResponse().id_token
            },
            body: JSON.stringify(partialSettings)
        });
    }

    turnOff() {
    }
}

module.exports = NodeController;

