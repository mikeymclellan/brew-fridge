import React, { PropTypes, Component } from 'react';
var NodeController = React.createFactory(require('./components/NodeController.jsx'));
var Config = require('./config.json');
import LoginButton from './components/LoginButton';
import Api from './lib/Api';

class App extends Component {

    propTypes: {
        baseUrl: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            googleUser: null,
            nodeUuids: []
        };
    }

    componentDidMount() {
        this.setState({isLoading: false});
    }

    updateGoogleUser(googleUser) {
        this.setState({googleUser: googleUser});
        this.api = new Api(this.props.baseUrl, googleUser);
        this.api.getUser((error, result) => {
            this.setState({nodeUuids: result.user.nodeUuids});
        });
    }

    render() {
        return (
            <div>
                <div className="navbar navbar-default">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-responsive-collapse">
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                            <a className="navbar-brand" href="javascript:void(0)">Brew Fridge</a>
                        </div>
                        <div className="navbar-collapse collapse navbar-responsive-collapse">
                            <ul className="nav navbar-nav navbar-right">
                                <LoginButton googleClientId={Config.google.clientId} updateUserCallback={(googleUser) => {this.updateGoogleUser(googleUser)}}/>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="container-fluid">
                    <div className="row">
                        {this.state.nodeUuids && this.state.nodeUuids.map((uuid) =>
                            <NodeController key={uuid} brewNodeUuid={uuid} api={this.api} googleUser={this.state.googleUser} baseUrl={this.props.baseUrl}/>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = App;