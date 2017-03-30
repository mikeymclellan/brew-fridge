var React = require('react');

module.exports =
    React.createClass({
        render: function() {
            // Initialize the Amazon Cognito credentials provider
            AWS.config.region = 'ap-southeast-2';
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: 'ap-southeast-2:375b85ca-b8da-430b-b595-afd69d8297b4',
            });

            var docClient = new AWS.DynamoDB.DocumentClient();

            var brewNodeUuid = 'b1f85ed9-78a7-40e0-b695-be3c0fd8a95b';
            var hoursBack = 48;

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
            }

            docClient.query(params, function(err, data) {

                if (err) {
                    console.log(err, err.stack);
                } else {

                    var rows = [];
                    data.Items.forEach(function (item) {
                        var row = {};
                        var dt = new Date(item.createdAt);

                        row.date = dt.toString().slice(0, -7);
                        row[item.type] = item.value;
                        rows.push(row);
                    });

                    var chart = c3.generate({
                        bindto: '#chart',

                        data: {
                            x: 'date',
                            xFormat: '%a %b %d %Y %H:%M:%S GMT%Z',
                            json: rows,
                            keys: {
                                x: 'date',
                                value: [ "temperature_reading", "relay_status_change" ]
                            }
                        },
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
                <div id="chart"></div>
            );
        }
    });
