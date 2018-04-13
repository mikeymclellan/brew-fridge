import React, { PropTypes, Component } from 'react';
import {Button, Paper, TextField}  from 'material-ui';

class Claim extends Component {

    propTypes: {
        match: PropTypes.object.isRequired,
        api: PropTypes.object.isRequired,
        googleUser: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = { nodeUuid: null, error: null };
    }

    componentDidMount() {
    }

    setNodeUuid(e) {
        this.setState({ nodeUuid: e.target.value });
    }

    handleClick(e) {
        this.props.api.claimNode(this.state.nodeUuid, (error, result) => {
            if (error) {
                console.log(error);
                this.setState({error: error});
            }
            console.log(result);
        });
    }

    render() {
        const style = {
            padding: 20,
            margin: 20,
            textAlign: 'center',
            display: 'inline-block',
        };

        let nodeUuid = null;

        if (this.props.match && this.props.match.params && this.props.match.params.uuid) {
            nodeUuid = this.props.match.params.uuid;
        }

        return (
            <div className="container-fluid">
                <div className="row">
                    <Paper style={style} zDepth={2}>
                        {this.state.error &&
                            <div className="alert alert-danger" role="alert">
                                There was an error claiming your node: {this.state.error.message}
                            </div>
                        }
                        {nodeUuid}<br/>
                        <TextField
                            hintText="Hint Text"
                            floatingLabelText="Node ID"
                            onChange={(e) => this.setNodeUuid(e)}
                        /><br/>

                        <Button variant="raised" color="primary" onClick={() => this.handleClick()}>
                            Claim Node
                        </Button>
                    </Paper>
                </div>
            </div>
        );
    }
}

module.exports = Claim;

