var fetch = require('node-fetch');

class Api {

    constructor(jwt = null, baseUrl = null) {
        this.jwt = jwt;
        this.baseUrl = baseUrl || 'https://m6tkeez3mk.execute-api.ap-southeast-2.amazonaws.com/dev';
    }

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

    putEvent(brewNodeUuid, type, value, callback) {
        const data = {
            brewNodeUuid: brewNodeUuid,
            type: type,
            value: value
        };
        return this.fetch('/event/put', callback, 'PUT', data);
    }
}

module.exports = Api;