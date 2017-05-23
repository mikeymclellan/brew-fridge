
var React = require('react');
var ReactDOM = require('react-dom');

var nodeData = {
    currentTemperature: 4.3,
    targetTemperature: 4,
    isEnabled: true
};

var App = React.createFactory(require('./App.jsx'));
ReactDOM.render(<App nodeData={nodeData}
                     brewNodeUuid="b1f85ed9-78a7-40e0-b695-be3c0fd8a95b"
                     baseUrl="https://4vcq2plqwd.execute-api.ap-southeast-2.amazonaws.com/dev"
/>, document.getElementById('app'));

