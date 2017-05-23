import React, { PropTypes, Component } from 'react';

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
            isSignedIn: false
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

    render() {
        const userProfile = this.state.isSignedIn?this.state.googleUser.getBasicProfile():null;

        // As a navbar dropdown
        if (this.state.isSignedIn) {
            return (
                <li className="dropdown">
                    <a href="javascript:void(0)" className="dropdown-toggle" data-toggle="dropdown">
                        <img src={userProfile.getImageUrl()} style={{borderRadius: '50%', width: '25px', marginRight: '5px'}}/>
                        {userProfile.getName()}
                        <b className="caret"></b>
                    </a>
                    <ul className="dropdown-menu">
                        <li><a href="javascript:void(0)" onClick={() => {
                            this.handleButtonClick()
                        }}>Sign Out</a></li>
                    </ul>
                </li>
            );
        } else {
            return (
                <li><a href="javascript:void(0)" onClick={() => { this.handleButtonClick() }}>Sign In</a></li>
            );
        }

        // Or as a button:
        return (
            <div>
                <button type="button" disabled={this.state.isDisabled ? "disabled" : false} onClick={() => {this.handleButtonClick()}} className="btn btn-raised btn-default">
                    {this.state.isSignedIn &&
                        <img src={userProfile.getImageUrl()} style={{ borderRadius: '50%', width: '25px', marginRight: '5px'}} />
                    }
                    {this.state.isSignedIn ? userProfile.getName() : "Sign In"}
                </button>
            </div>
        );
    }
}

module.exports = LoginButton;

