var GoogleAuth = require('google-auth-library');
const config = require('../config');

class Request {
    verifyUser(request, callback) {

        if (typeof request.headers.Authorization === 'undefined') {
            return callback('Missing Authorization header', null);
        }

        const token = this.getTokenFromBearer(request.headers.Authorization);

        if (!token) {
            return callback('Missing Bearer token', null);
        }

        const auth = new GoogleAuth();
        // Not actually sure if it's using clientSecret or just google's public key to verify?
        const client = new auth.OAuth2(config.google.clientId, config.google.clientSecret, '');

        client.verifyIdToken(
            token,
            config.google.clientId,
            (e, login) => {
                callback(e, login.getPayload());
            });
    }

    getTokenFromBearer(bearer)
    {
        const items = bearer.split(/[ ]+/);

        if (items.length > 1 && items[0].trim() === 'Bearer') {
            return items[1];
        }
        return null;
    }
}

module.exports = new Request();
