
const AWS = require('aws-sdk');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch');


exports.changeHandler = function (event, context, callback) {
    /*context.callbackWaitsForEmptyEventLoop = false  */
    var username = JSON.parse(event.body)["username"];
    var password = JSON.parse(event.body)["password"];
    var newpassword = JSON.parse(event.body)["newpassword"];
    try {


        const poolData = {
            UserPoolId: process.env.USERPOOLID, // Your user pool id here    
            ClientId: process.env.CLIENT_ID // Your client id here
        };


        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password
        });

        var userData = {
            Username: username,
            Pool: userPool
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            newPasswordRequired: function (userAttributes) {
                delete userAttributes.email_verified;
                cognitoUser.completeNewPasswordChallenge(newpassword, userAttributes, {
                    onSuccess: function () {
                        console.log("Usuario " + username + " ha cambiado su password");
                        callback(null, {
                            "statusCode": 200,
                            "headers": {
                                "Content-type": "application/json", 'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Methods': 'POST,OPTIONS,GET,HEAD',
                                'Access-Control-Allow-Credentials': true,
                                'Access-Control-Allow-Headers': '*'
                            },
                            "body": JSON.stringify({
                                'username': username,
                                'token': '',
                                'mensaje': 'Password cambiado exitosamente'
                            })
                        })
                    },
                    onFailure: function (err) {
                        console.log("Ha ocurrido un error en el cambio de password del usuario: " + username + "\n" + err);
                        callback(null, {
                            "statusCode": 500,
                            "headers": {
                                "Content-type": "application/json", 'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Methods': 'POST,OPTIONS,GET,HEAD',
                                'Access-Control-Allow-Credentials': true,
                                'Access-Control-Allow-Headers': '*'
                            },
                            body: JSON.stringify({
                                message: err.message
                            })
                        })
                    }
                });
            },
            onFailure: function (err) {
                console.log("Ha ocurrido un error en el cambio de password del usuario: " + username + "\n" + err);
                callback(null, {
                    "statusCode": 500,
                    "headers": {
                        "Content-type": "application/json", 'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST,OPTIONS,GET,HEAD',
                        'Access-Control-Allow-Credentials': true,
                        'Access-Control-Allow-Headers': '*'
                    },
                    body: JSON.stringify({
                        message: err.message
                    })
                })
            }

        });
    }
    catch (err) {
        errores.push(`Ha ocurrido un error en el cambio de password del usuario: ${err}`);
        console.log("Ha ocurrido un error en el cambio de password del usuario: " + username + "\n" + err);
        /* await invokeErrorNotification(errores); */
        invokeErrorNotification(errores);
        callback(null,
            {
                "statusCode": 500,
                "headers": {
                    "Content-type": "application/json", 'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS,GET,HEAD',
                    'Access-Control-Allow-Credentials': true,
                    'Access-Control-Allow-Headers': '*'
                },
                "body": JSON.stringify({
                    'message': err.message
                })
            })
    }
};

async function invokeErrorNotification(errores) {
    var functionName = process.env.MESSENGERFUNCTION;
    var lambda = new AWS.Lambda();
    var erroresObj = { errores: errores };
    var params = {
        FunctionName: functionName,
        InvokeArgs: JSON.stringify(erroresObj)
    };
    try {
        var invokePromise = await lambda.invokeAsync(params).promise();
    } catch (err) {
        console.log("Ha ocurrido un error al llamar funcion de notificacion: ", err);
    }
    if (invokePromise) {
        console.log(invokePromise);
    }
}