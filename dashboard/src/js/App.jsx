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
import Menu, { MenuItem } from 'material-ui/Menu';


class App extends Component {

    propTypes: {
        baseUrl: PropTypes.string,
    };

    constructor(props) {
        super(props);

        this.state = {
            googleUser: null,
            nodeUuids: [],
            menuAnchorElement: null,
            isLoading: true,
            api: null
        };
    }

    componentWillUnmount()
    {
        this.setState({isLoading: true});
    }

    componentDidMount() {
        this.setState({isLoading: false});
    }

    updateGoogleUser(googleUser) {
        if (this.state.isLoading) {
            return;
        }
        this.setState({googleUser: googleUser});
        let api = new Api(googleUser.getAuthResponse().id_token, this.props.baseUrl);
        this.setState({api: api});
        api.getUser((error, result) => {
            if (error) {
                console.log(error);
            }
            this.setState({nodeUuids: result.user.nodeUuids});
        });
    }

    handleMenuOpen(event) {
        this.setState({ menuAnchorElement: event.currentTarget });
    }

    handleMenuClose() {
        this.setState({ menuAnchorElement: null });
    }

    render() {
        const nodeListProps = {
            nodeUuids: this.state.nodeUuids,
            api: this.state.api,
            googleUser: this.state.googleUser,
            baseUrl: this.props.baseUrl
        };

        const claimProps = {
            api: this.state.api,
            googleUser: this.state.googleUser,
            baseUrl: this.props.baseUrl
        };

        return (
            <BrowserRouter>
                <div style={{flexGrow: 1}}>
                    <AppBar position="static">
                        <Toolbar>
                            <IconButton color="inherit" aria-label="Menu"
                                        aria-owns={this.state.menuAnchorElement ? 'simple-menu' : null}
                                        aria-haspopup="true"
                                        onClick={(e) => {this.handleMenuOpen(e)}}>
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="simple-menu"
                                anchorEl={this.state.menuAnchorElement}
                                open={Boolean(this.state.menuAnchorElement)}
                                onClose={(e) => {this.handleMenuClose(e)}}
                            >
                                <MenuItem onClick={(e) => {this.handleMenuClose(e)}}><Link to='/claim'>Claim</Link></MenuItem>
                                <MenuItem onClick={(e) => {this.handleMenuClose(e)}}><Link to='/'>Home</Link></MenuItem>
                            </Menu>

                            <Typography variant="title" color="inherit" style={{flex: 1}}>
                                Brew Fridge
                            </Typography>
                            <LoginButton googleClientId={Config.google.clientId} updateUserCallback={(googleUser) => {this.updateGoogleUser(googleUser)}}/>
                        </Toolbar>
                    </AppBar>
                    <Route render={() => <NodeControllerList {...nodeListProps} /> }/>
                    <Route path="/claim/:uuid?" render={(props) => <Claim {...props} {...claimProps} /> }/>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;