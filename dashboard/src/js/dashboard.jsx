
var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createFactory(require('./App.jsx'));

ReactDOM.render(<App baseUrl="https://m6tkeez3mk.execute-api.ap-southeast-2.amazonaws.com/dev"
/>, document.getElementById('app'));

