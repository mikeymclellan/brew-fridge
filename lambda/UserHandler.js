'use strict';

const Request = require('./lib/Request');
const Responder = require('./lib/Responder');
const User = require('./model/User');


module.exports.get = (event, context, callback) => {

    Request.verifyUser(event, (error, user) => {
        if (error) {
            return Responder.respond(callback, {result: false, message: error});
        }

        User.get({id: user.sub}, (error, user) => {
            if (error) {
                return Responder.respond(callback, {result: false, message: error});
            }

            return Responder.respond(callback, {result: true, user: user});
        });
    });
};


