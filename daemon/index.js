var BrewFridge = require('./brewfridge');

var daemon = new BrewFridge(require('./config')());
daemon.initialise(process);
