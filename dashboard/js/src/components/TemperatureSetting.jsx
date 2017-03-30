var React = require('react');

class TemperatureSetting extends React.Component {

    constructor() {
        super();

        this.state = {
            temperature: null,
            isEnabled: true
        };
    }

    render() {
        return (
            <div>
                {this.props.temperature}&deg;
                <button type="button" class="btn btn-default"><span class="glyphicon glyphicon glyphicon-menu-up" aria-hidden="true"></span></button>
                <button type="button" class="btn btn-default"><span class="glyphicon glyphicon glyphicon-menu-down" aria-hidden="true"></span></button>
                <button type="button" class="btn btn-default"><span class="glyphicon glyphicon glyphicon-off" aria-hidden="true"></span></button>
            </div>
        );
    }
}

module.exports = TemperatureSetting;

