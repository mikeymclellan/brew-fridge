
class Responder {

    respond(callback, result = {result: true}, statusCode = 200) {

        // If result is a string it's assumed to be an error message
        if (typeof result === 'string') {
            result = { result: false, message: result};
            if (statusCode === 200) {
                statusCode = 500;
            }
        }

        if (result === null) {
            result = {result: true};
        }

        if (statusCode !== 200) {
            result.result = false;
            console.log('Responder.respond: '+statusCode+(typeof result.message !== 'undefined'?', '+result.message:''));
        }

        callback(null, {
            statusCode: statusCode,
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS }
            },
            body: JSON.stringify(result)
        });
    }
}

module.exports = new Responder();
