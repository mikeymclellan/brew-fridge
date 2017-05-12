var React = require('react');
var EventChart = React.createFactory(require('./components/EventChart.jsx'));
var TemperatureReading = React.createFactory(require('./components/TemperatureReading.jsx'));
var TemperatureSetting = React.createFactory(require('./components/TemperatureSetting.jsx'));

class App extends React.Component {

    propTypes: {
        brewNodeUuid: React.PropTypes.string.isRequired,
        baseUrl: React.PropTypes.string.isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            node: null,
            isLoading: true,
        };
    }

    componentDidMount() {

        this.setState({isLoading: false});

        fetch(this.props.baseUrl + '/node/' + this.props.brewNodeUuid)
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                console.log('fetch node data', json)
                this.setState({node: json.node
                    , isLoading: false
                });
            })
            .catch((exception) => {
                console.log('parsing failed', exception)
            });
    }

    render() {

        if (this.state.node === null) {
            return (
                <div>Loading...</div>
            );
        } else {
            return (
                <div>
                    <EventChart />
                    <TemperatureReading temperature={this.props.nodeData.currentTemperature}/>
                    <TemperatureSetting temperature={this.state.node.settings.targetTemperature}
                                        brewNodeUuid={this.props.brewNodeUuid} baseUrl={this.props.baseUrl}/>
                </div>
            );
        }
    }
}

module.exports = App;