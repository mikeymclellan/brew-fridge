import React, { PropTypes, Component } from 'react';

class Claim extends Component {

    propTypes: {
        match: PropTypes.object.isRequired,
        api: PropTypes.object.isRequired,
        googleUser: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = { nodeUuid: null };
    }

    componentDidMount() {
    }

    setNodeUuid(e) {
        this.setState({ nodeUuid: e.target.value });
    }

    handleClick(e) {
        this.props.api.claimNode(this.state.nodeUuid, (error, result) => {
            console.log(error);
            console.log(result);
        });
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    {this.props.match.params.uuid}

                    <input type="text" onChange={(e) => this.setNodeUuid(e)} />
                    <button type="button" className="btn btn-default" onClick={() => this.handleClick()}>Claim</button>
                </div>
            </div>
        );
    }
}

module.exports = Claim;

