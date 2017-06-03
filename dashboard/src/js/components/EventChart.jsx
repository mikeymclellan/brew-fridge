var React = require('react');

class EventChart extends React.Component {

    render()
    {
        // Initialize the Amazon Cognito credentials provider
        AWS.config.region = 'ap-southeast-2';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'ap-southeast-2:375b85ca-b8da-430b-b595-afd69d8297b4',
        });

        var docClient = new AWS.DynamoDB.DocumentClient();

        var brewNodeUuid = this.props.brewNodeUuid; // 'b1f85ed9-78a7-40e0-b695-be3c0fd8a95b';
        var hoursBack = 24;

        // Generating a string of the last X hours back
        var d = new Date(new Date().getTime() - (hoursBack * 3600 * 1000));
        var yesterdayDateString = d.getUTCFullYear() + '-'
            + ('0' + (d.getUTCMonth()+1)).slice(-2) + '-'
            + ('0' + d.getUTCDate()).slice(-2) + 'T'
            + ('0' + (d.getUTCHours()+1)).slice(-2) + ':00:00+0000';

        // DynamoDB Query
        var params = {
            TableName: "Event",
            Limit: 50000,
            ConsistentRead: false,
            ScanIndexForward: true,
            ExpressionAttributeValues:{
                ":brew_node_uuid": brewNodeUuid,
                ":start_date":yesterdayDateString
            },
            KeyConditionExpression :
                "brewNodeUuid = :brew_node_uuid AND createdAt >= :start_date"
        };

        var self = this;

        docClient.query(params, function(err, data) {

            if (err) {
                console.log(err, err.stack);
            } else {

                var chart = c3.generate({
                    bindto: '#chart-'+self.props.brewNodeUuid,

                    data: {
                        x: 'date',
                        xFormat: '%a %b %d %Y %H:%M:%S GMT%Z',
                        json: self.formatRows(data.Items),
                        keys: {
                            x: 'date',
                            value: [ "temperature_reading"]
                        }
                    },
                    regions: self.formatRegions(data.Items),
                    zoom: {
                        enabled: true
                    },
                    point: {
                        show: false
                    },
                    axis: {
                        x: {
                            type: 'timeseries',
                            localtime: true,
                            tick: {
                                format: '%Y-%m-%d %I:%M%p'
                            }
                        }
                    },
                    line: {
                        connectNull: true
                    }
                });
            }
        });
        return (
            <div id={'chart-'+this.props.brewNodeUuid}></div>
        );
    }

    formatRegions(items)
    {
        var types = [];

        items.forEach(function (item) {

            if (item.type.indexOf('ing_relay_status_change') === -1) {
                return;
            }

            if (typeof types[item.type] === 'undefined') {
                types[item.type] = [];
            }

            if (item.value) {
                // Get the previousRegion and check it's ended correctly
                var previousRegion = types[item.type].pop();

                if (typeof previousRegion !== 'undefined') {
                    if (typeof previousRegion.end === 'undefined' && typeof previousRegion.start !== 'undefined') {
                        // The previousRegion hasn't ended for some reason, let's just end it now
                        previousRegion.end = new Date(item.createdAt);
                    }

                    // Put the previous regoin back
                    types[item.type].push(previousRegion);
                }

                types[item.type].push({start: new Date(item.createdAt), class: item.type});
            } else {
                // Get the previousRegion and set the end date
                var previousRegion = types[item.type].pop();

                if (typeof previousRegion === 'undefined') {
                    // There is no previous 'on' state, assume is was just turned on and off.
                    previousRegion = {class: item.type, start: new Date(item.createdAt)};
                }
                previousRegion.end = new Date(item.createdAt);
                types[item.type].push(previousRegion);
            }
        });

        var regions = [];

        for (var type in types) {
            regions = regions.concat(types[type]);
        }
        return regions;
    }

    formatRows(items) {
        var rows = [];

        items.forEach(function (item) {

            if (item.type.indexOf('ing_relay_status_change') !== -1) {
                return;
            }

            var row = {};
            var dt = new Date(item.createdAt);

            row.date = dt.toString().slice(0, -7);
            row[item.type] = item.value;
            rows.push(row);
        });

        return rows;
    }
}

module.exports = EventChart;