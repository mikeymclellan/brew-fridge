var Backbone = require('backbone');

module.exports = function(/*module dependencies*/) {
    return Backbone.Router.extend({
        initialize: function() {
            Backbone.history.start();
        },
        routes: {
            // create any routes required and handle with this.select function
            "": "dashboard",
            "login": "login"
        },
        dashboard: function() {
            require('./dashboard.jsx');
        },
        login: function() {
            console.log('login');
            // do something with Backbone.history.fragment value
        }
    });
};