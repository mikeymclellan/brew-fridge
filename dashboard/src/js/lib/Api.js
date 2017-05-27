
class Api {

    googleUser: null;
    baseUrl: null;

    constructor(baseUrl, googleUser) {
        this.baseUrl = baseUrl;
        this.googleUser = googleUser;
    }

    fetch(url, callback, method = 'GET', postData = null) {
        fetch(this.baseUrl+url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.googleUser.getAuthResponse().id_token
            },
            body: postData?JSON.stringify(partialSettings):null
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
}

module.exports = Api;