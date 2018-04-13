import React, { PropTypes, Component } from 'react';
import Card, { CardContent } from 'material-ui/Card';
import Switch from 'material-ui/Switch';
import Typography from 'material-ui/Typography';
import Select from 'material-ui/Select';
import Input, { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl, FormHelperText } from 'material-ui/Form';

var EventChart = React.createFactory(require('./EventChart.jsx'));

class NodeController extends Component {

    propTypes: {
        brewNodeUuid: PropTypes.string.isRequired,
        api: PropTypes.object.isRequired,
        googleUser: PropTypes.object.isRequired,
        baseUrl: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            targetTemperature: 0,
            isEnabled: true,
            node: null,
            isLoading: true,
        };
    }

    componentDidMount() {
        this.props.api.getNode(this.props.brewNodeUuid, (error, result) => {

            if (error) {
                return console.log('NodeController error: '+ error);
            }
            this.setState({node: result.node
                , isLoading: false
                , targetTemperature: result.node.settings?result.node.settings.targetTemperature:0
            });
        });
    }

    render() {
        if (this.state.isLoading) {
            return (
                <div>Loading...</div>
            );
        }

        return (
            <Card style={{min____Width:'350px'}}>
                <CardContent>
                    <Typography variant="display4">
                        {this.state.node.currentTemperature}&deg;
                        <Switch
                            checked={this.state.isEnabled}
                            onChange={(e) => {this.toggleEnabled(e)}}
                            value="1"
                        />
                    </Typography>
                    <FormControl >
                        <InputLabel htmlFor="age-simple">Target</InputLabel>
                        <Select
                            value={this.state.targetTemperature}
                            onChange={(e) => {this.temperatureChangeHandler(e)}}
                            inputProps={{
                                name: 'targetTemperature',
                                id: 'target-temperature',
                            }}
                        >
                            <MenuItem value={30}>30&deg;</MenuItem>
                            <MenuItem value={29}>29&deg;</MenuItem>
                            <MenuItem value={28}>28&deg;</MenuItem>
                            <MenuItem value={27}>27&deg;</MenuItem>
                            <MenuItem value={26}>26&deg;</MenuItem>
                            <MenuItem value={25}>25&deg;</MenuItem>
                            <MenuItem value={24}>24&deg;</MenuItem>
                            <MenuItem value={23}>23&deg;</MenuItem>
                            <MenuItem value={22}>22&deg;</MenuItem>
                            <MenuItem value={21}>21&deg;</MenuItem>
                            <MenuItem value={20}>20&deg;</MenuItem>
                            <MenuItem value={19}>19&deg;</MenuItem>
                            <MenuItem value={18}>18&deg;</MenuItem>
                            <MenuItem value={17}>17&deg;</MenuItem>
                            <MenuItem value={16}>16&deg;</MenuItem>
                            <MenuItem value={15}>15&deg;</MenuItem>
                            <MenuItem value={14}>14&deg;</MenuItem>
                            <MenuItem value={13}>13&deg;</MenuItem>
                            <MenuItem value={12}>12&deg;</MenuItem>
                            <MenuItem value={11}>11&deg;</MenuItem>
                            <MenuItem value={10}>10&deg;</MenuItem>
                            <MenuItem value={9}>9&deg;</MenuItem>
                            <MenuItem value={8}>8&deg;</MenuItem>
                            <MenuItem value={7}>7&deg;</MenuItem>
                            <MenuItem value={6}>6&deg;</MenuItem>
                            <MenuItem value={5}>5&deg;</MenuItem>
                            <MenuItem value={4}>4&deg;</MenuItem>
                            <MenuItem value={3}>3&deg;</MenuItem>
                            <MenuItem value={2}>2&deg;</MenuItem>
                            <MenuItem value={1}>1&deg;</MenuItem>
                            <MenuItem value={-1}>-1&deg;</MenuItem>
                            <MenuItem value={-2}>-2&deg;</MenuItem>
                            <MenuItem value={-3}>-3&deg;</MenuItem>
                            <MenuItem value={-4}>-4&deg;</MenuItem>
                            <MenuItem value={-5}>-5&deg;</MenuItem>
                            <MenuItem value={-6}>-6&deg;</MenuItem>
                        </Select>
                    </FormControl>
                    {/*<EventChart brewNodeUuid={this.props.brewNodeUuid} />*/}
                </CardContent>
            </Card>
        );
    }

    temperatureChangeHandler(event) {
        this.setState({targetTemperature: event.target.value});
        this.nodeUpdateSettings({targetTemperature: event.target.value});
    }

    nodeUpdateSettings(partialSettings) {
        this.props.api.updateNodeSettings(this.props.brewNodeUuid, partialSettings, (error, result) => {
            if (error) {
                console.log(error);
                this.setState({error: error});
            }
            console.log(result);
        });
    }

    toggleEnabled() {
        this.setState({isEnabled: !this.state.isEnabled});
    }
}

module.exports = NodeController;

