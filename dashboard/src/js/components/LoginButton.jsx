import React, { PropTypes, Component } from 'react';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';
import Typography from 'material-ui/Typography';

class LoginButton extends Component {
    propTypes: {
        googleClientId: PropTypes.string.isRequired,
        updateUserCallback: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.auth = null;
        this.state = {
            googleUser: null,
            isDisabled: true,
            isSignedIn: false,
            anchorEl: null
        };
    }

    componentDidMount() {
        const firstScriptTag = document.getElementsByTagName('script')[0];
        const googleScriptTag = document.createElement('script');
        googleScriptTag.src = '//apis.google.com/js/client:platform.js';

        googleScriptTag.onload = () => {
            window.gapi.load('auth2', () => {
                this.setState({isDisabled: false});

                window.gapi.auth2.init({
                    client_id: this.props.googleClientId,
                    scope: 'profile email'
                }).then(() => {},
                    err => console.error(err)
                );

                this.auth = window.gapi.auth2.getAuthInstance();

                // Listen for changes to current user - https://developers.google.com/identity/sign-in/web/listeners
                this.auth.currentUser.listen((currentUser) => {this.handleSignInStateChange(currentUser)});

                // Sign in the user if they are currently signed in.
                if (this.auth.isSignedIn.get() == true) {
                    this.auth.signIn();
                }
            });
        };
        firstScriptTag.parentNode.insertBefore(googleScriptTag, firstScriptTag);
    }

    handleSignInStateChange(googleUser) {
        this.setState({googleUser: googleUser, isSignedIn: googleUser.isSignedIn()});
        if (this.props.updateUserCallback) {
            this.props.updateUserCallback(googleUser);
        }
    }

    handleButtonClick() {
        if (this.state.isSignedIn) {
            return this.auth.signOut();
        }
        this.auth.signIn();
    }

    handleMenu(event) {
        this.setState({ anchorEl: event.currentTarget });
    }

    handleClose() {
        this.setState({ anchorEl: null });
    };

    render() {
        const {anchorEl} = this.state;
        const open = Boolean(anchorEl);
        const userProfile = this.state.isSignedIn?this.state.googleUser.getBasicProfile():null;

        if (this.state.isSignedIn) {
            return (
                <div>
                    <IconButton
                        aria-owns={open ? 'menu-appbar' : null}
                        aria-haspopup="true"
                        onClick= {(event) => { this.handleMenu(event) }}
                        color="inherit"
                    >
                        <Typography variant="body1" color="inherit">
                            <img src={userProfile.getImageUrl()} style={{borderRadius: '50%', width: '25px', marginRight: '5px'}}/>
                        </Typography>
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={open}

                        onClose={() => {this.handleClose()}}
                    >
                        <MenuItem onClick={(event) => { this.handleButtonClick(event)}}>Sign Out</MenuItem>
                    </Menu>
                </div>
            );
        } else {
            return (
                <Button onClick={() => { this.handleButtonClick() }} color="inherit">Login</Button>
            );
        }
    }
}

module.exports = LoginButton;

