var BrewFridge = require('./brewfridge');

var daemon = new BrewFridge();
daemon.initialise(process);
