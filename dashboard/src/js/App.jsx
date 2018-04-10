import React, { PropTypes, Component } from 'react'
import { Switch, Route, Link, BrowserRouter } from 'react-router-dom'
import NodeControllerList from './components/NodeControllerList.jsx'
import Config from './config.json'
import LoginButton from './components/LoginButton'
import Claim from './components/Claim'
import Api from '../../../lib/Api'

class App extends Component {

    propTypes: {
        baseUrl: PropTypes.string
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
        this.api = new Api(googleUser.getAuthResponse().id_token, this.props.baseUrl);
        this.api.getUser((error, result) => {
            if (error) {
                console.log(error);
            }
            this.setState({nodeUuids: result.user.nodeUuids});
        });
    }

    render() {
        const nodeListProps = {
            nodeUuids: this.state.nodeUuids,
            api: this.api,
            googleUser: this.state.googleUser,
            baseUrl: this.props.baseUrl
        };

        const claimProps = {
            api: this.api,
            googleUser: this.state.googleUser,
            baseUrl: this.props.baseUrl
        };

        return (
            <BrowserRouter>
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
                    <Link to='/claim/skjfghksg'>Claim</Link>
                    <Link to='/'>Home</Link>
                    <Route exact path="/" render={() => <NodeControllerList {...nodeListProps} /> }/>
                    <Route exact path="/claim/:uuid" render={(props) => <Claim {...props} {...claimProps} /> }/>
                </div>
            </BrowserRouter>
        );
    }
}

module.exports = App;