
var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createFactory(require('./App.jsx'));

ReactDOM.render(<App />, document.getElementById('app'));

