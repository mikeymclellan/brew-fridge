import React, { PropTypes, Component } from 'react';
import {Button, Paper, TextField}  from 'material-ui';
import Typography from 'material-ui/Typography';
import Dialog, { DialogTitle, DialogContent, DialogActions, DialogContentText } from 'material-ui/Dialog';
import { withRouter } from "react-router-dom";


class Claim extends Component {

    propTypes: {
        match: PropTypes.object.isRequired,
        api: PropTypes.object.isRequired,
        googleUser: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = { nodeUuid: '', error: null, node: null };
    }

    componentDidMount() {
        this.handlePropsChange();
    }

    componentWillReceiveProps(nextProps) {
        this.handlePropsChange();
    }

    /**
     * Props change notably when a user logs in and the `api` is updated, we then must trigger refresh of node data.
     */
    handlePropsChange() {
        if (this.props.match && this.props.match.params && this.props.match.params.uuid) {
            this.setNodeUuid(this.props.match.params.uuid);
        }
    }

    handleNodeUuidChange(e) {
        this.setNodeUuid(e.target.value);
    }

    setNodeUuid(uuid) {
        this.setState({ nodeUuid: uuid, error: null });
        if (!this.props.api) {
            return;
        }
        this.props.api.getNode(uuid, (error, result) => {
            if (error) {
                this.setState({error: error});
                return;
            }
            if (result.error) {
                this.setState({error: result.error});
                return;
            }
            this.setState({node: result.node});
        });
    }

    handleClick(e) {
        this.props.api.claimNode(this.state.nodeUuid, (error, result) => {
            if (error) {
                this.setState({error: error});
                return;
            }
            this.props.history.push('/');
        });
    }

    render() {
        return (
            <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" open={true}>
                <DialogTitle id="simple-dialog-title">Claim This Device?</DialogTitle>
                <DialogContent>
                    {this.state.node &&
                        <DialogContentText id="alert-dialog-description">
                            Current temperature is <strong>{this.state.node.currentTemperature}&deg;</strong>. Add this device to your account?
                        </DialogContentText>
                    }
                    {!this.state.node &&
                        <DialogContentText id="alert-dialog-description">
                            Enter the Node ID you'd like to claim.
                        </DialogContentText>
                    }
                    {this.state.error &&
                        <DialogContentText id="alert-dialog-description">
                            There was an error claiming your node: {this.state.error.message}
                        </DialogContentText>
                    }
                    <TextField
                        id="node-uuid"
                        label="Node ID"
                        value={this.state.nodeUuid}
                        onChange={(e) => this.handleNodeUuidChange(e)}
                        margin="normal"
                        fullWidth
                    /><br />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} >
                        Cancel
                    </Button>
                    {!this.state.error && this.state.node &&
                        <Button onClick={() => this.handleClick()} color="primary" autoFocus>
                            Continue
                        </Button>
                    }
                </DialogActions>
            </Dialog>
        );
    }
}

module.exports = Claim;

