import React, { PropTypes, Component } from 'react';
import NodeController from './NodeController.jsx'
import Grid from 'material-ui/Grid';


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
            <Grid container spacing={16} style={{flexGrow:1, margin: 0, paddingRight: '15px'}}>
                {this.props.nodeUuids && this.props.nodeUuids.map((uuid) =>
                    <Grid item key={'controller-'+uuid} xs={12} sm={4}>
                        <NodeController key={uuid} brewNodeUuid={uuid} api={this.props.api} googleUser={this.props.googleUser} baseUrl={this.props.baseUrl}/>
                    </Grid>
                )}
            </Grid>
        );
    }
}

module.exports = NodeControllerList;