require('bootstrap');
require('bootstrap/dist/css/bootstrap.css');
require('bootstrap-material-design');
require('bootstrap-material-design/dist/css/bootstrap-material-design.css');

import React from 'react'
import ReactDOM from 'react-dom'

const App = React.createFactory(require('./App.jsx'));
ReactDOM.render(<App />, document.getElementById('app'));

const $ = jQuery = require('jquery');
$.material.init();