import React, { PropTypes, Component } from 'react';
import NodeController from './NodeController.jsx'

class NodeControllerList extends Component {

    propTypes: {
        nodeUuids: PropTypes.object.isRequired,
        api: PropTypes.object.isRequired,
        googleUser: PropTypes.object.isRequired,
        baseUrl: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
        };
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    {this.props.nodeUuids && this.props.nodeUuids.map((uuid) =>
                        <NodeController key={uuid} brewNodeUuid={uuid} api={this.props.api} googleUser={this.props.googleUser} baseUrl={this.props.baseUrl}/>
                    )}
                </div>
            </div>
        );
    }
}

module.exports = NodeControllerList;