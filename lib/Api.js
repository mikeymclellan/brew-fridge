const fetch = require('node-fetch');

const LAMBDA_BASE_URL = 'https://m6tkeez3mk.execute-api.ap-southeast-2.amazonaws.com/dev';

class Api {

    constructor(jwt = null, baseUrl = null) {
        this.jwt = jwt;
        this.baseUrl = baseUrl || LAMBDA_BASE_URL;
    }

    /**
     * Assumes all responses return a json object with at least bool `result`
     *
     * @param url
     * @param callback
     * @param method
     * @param postData
     */
    fetch(url, callback, method = 'GET', postData = null) {
        fetch(this.baseUrl+url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.jwt
            },
            body: postData?JSON.stringify(postData):null
        })
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            if (json.result === false) {
                console.log('Api error for \''+url+'\': '+json.message);
                return callback(json.message, null);
            }
            return callback(null, json);
        })
        .catch((exception) => {
            console.log('Api exception for \''+url+'\': '+exception);
            return callback(exception, null);
        });
    }

    getUser(callback) {
        return this.fetch('/user', callback);
    }

    getNode(uuid, callback) {
        return this.fetch('/node/' + uuid, callback);
    }

    claimNode(uuid, callback) {
        return this.fetch('/node/claim/' + uuid, callback);
    }

    registerNode(callback) {
        return this.fetch('/node/register', callback);
    }

    putEvent(brewNodeUuid, type, value, callback) {
        const data = {
            brewNodeUuid: brewNodeUuid,
            type: type,
            value: value
        };
        return this.fetch('/event/put', callback, 'PUT', data);
    }

    updateNodeSettings(brewNodeUuid, partialSettings, callback)
    {
        return this.fetch('/node/'+brewNodeUuid+'/settings', callback, 'POST', partialSettings);
    }
}

module.exports = Api;