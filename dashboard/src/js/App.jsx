import React, { PropTypes, Component } from 'react';
var NodeController = React.createFactory(require('./components/NodeController.jsx'));
var Config = require('./config.json');
import LoginButton from './components/LoginButton';

class App extends Component {

    propTypes: {
        brewNodeUuid: PropTypes.string.isRequired,
        baseUrl: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            googleUser: null
        };
    }

    componentDidMount() {
        this.setState({isLoading: false});

        fetch(this.props.baseUrl + '/node/' + this.props.brewNodeUuid)
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                this.setState({node: json.node
                    , isLoading: false
                });
            })
            .catch((exception) => {
                console.log('parsing failed', exception)
            });
    }

    updateGoogleUser(googleUser) {
        this.setState({googleUser: googleUser});
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
                        {this.state.googleUser
                            && this.state.googleUser.isSignedIn()
                            && this.state.googleUser.getBasicProfile().getEmail() === 'mikey@mclellan.org.nz' &&
                                <NodeController brewNodeUuid={this.props.brewNodeUuid} googleUser={this.state.googleUser} baseUrl={this.props.baseUrl}/>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = App;