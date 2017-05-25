
var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createFactory(require('./App.jsx'));

ReactDOM.render(<App brewNodeUuid="b1f85ed9-78a7-40e0-b695-be3c0fd8a95b"
                     baseUrl="https://m6tkeez3mk.execute-api.ap-southeast-2.amazonaws.com/dev"
/>, document.getElementById('app'));

