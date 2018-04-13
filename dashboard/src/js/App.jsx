import React, { PropTypes, Component } from 'react'
import { Switch, Route, Link, BrowserRouter } from 'react-router-dom'
import NodeControllerList from './components/NodeControllerList.jsx'
import Config from './config.json'
import LoginButton from './components/LoginButton'
import Claim from './components/Claim'
import Api from '../../../lib/Api'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

class App extends Component {

    propTypes: {
        baseUrl: PropTypes.string,
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
                <div style={{flexGrow: 1}}>
                    <AppBar position="static">
                        <Toolbar>
                            <IconButton color="inherit" aria-label="Menu">
                                <MenuIcon />
                            </IconButton>
                            <Typography variant="title" color="inherit" style={{flex: 1}}>
                                Brew Fridge
                            </Typography>
                            <LoginButton googleClientId={Config.google.clientId} updateUserCallback={(googleUser) => {this.updateGoogleUser(googleUser)}}/>
                        </Toolbar>
                    </AppBar>

                    <Link to='/claim/skjfghksg'>Claim</Link>
                    <Link to='/'>Home</Link>
                    <Route exact path="/" render={() => <NodeControllerList {...nodeListProps} /> }/>
                    <Route exact path="/claim/:uuid" render={(props) => <Claim {...props} {...claimProps} /> }/>
                    <Claim api={this.api} googleUser={this.state.googleUser} />
                </div>
            </BrowserRouter>
        );
    }
}

export default App;