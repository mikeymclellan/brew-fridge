
var React = require('react');
var ReactDOM = require('react-dom');
var router = new (require('./router.js')());

var nodeData = {
    currentTemperature: 4.3,
    targetTemperature: 4,
    isEnabled: true
};

var App = React.createFactory(require('./App.jsx'));
ReactDOM.render(<App router={router} nodeData={nodeData}/>, document.getElementById('app'));
