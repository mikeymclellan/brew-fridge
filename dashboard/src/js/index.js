var $ = jQuery = require('jquery');
require('bootstrap');
require('bootstrap/dist/css/bootstrap.css');
require('bootstrap-material-design');
require('bootstrap-material-design/dist/css/bootstrap-material-design.css');

new (require('./router.js')());

$.material.init();