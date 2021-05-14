const AWS = require('aws-sdk');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch');


exports.lambdaHandler = function (event, context, callback) {

    var username = JSON.parse(event.body)["username"];
    var password = JSON.parse(event.body)["password"];
    try {
        const poolData = {
            UserPoolId: process.env.USERPOOLID, // Your user pool id here    
            ClientId: process.env.CLIENT_ID // Your client id here
        };
        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);


        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password,
        });

        var userData = {
            Username: username,
            Pool: userPool
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (session) {
                const tokens = {
                    access_token: session.getAccessToken().getJwtToken(),
                    id_token: session.getIdToken().getJwtToken(),
                    refresh_token: session.getRefreshToken().getToken()
                };
                var params = {
                    AccessToken: tokens.access_token
                };
                var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
                cognitoidentityserviceprovider.getUser(params, function (err, data) {
                    if (err) {
                        callback(null, {
                            "statusCode": 500,
                            "headers": {
                                "Content-type": "application/json", 'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Methods': 'POST,OPTIONS,GET,HEAD',
                                'Access-Control-Allow-Credentials': true,
                                'Access-Control-Allow-Headers': '*'
                            },
                            body: JSON.stringify({
                                message: err
                            })
                        })
                    }
                    else {
                        //GET empresa from custom attributes
                        var empresaAttribute = data.UserAttributes.filter(
                            function(data){ return data.Name == "custom:empresa" }
                        )[0];
                        //Compare to empresa variable in deployment
                        if (empresaAttribute.Value === process.env.EMPRESA) {
                            cognitoUser['tokens'] = tokens;
                            var cookie = 'id_token=' + tokens.id_token;
                            console.log("Usuario " + username + " se ha loggeado");
                            callback(null, {
                                "statusCode": 200,
                                "headers": {
                                    "Set-Cookie": cookie, "Content-type": "application/json", 'Access-Control-Allow-Origin': '*',
                                    'Access-Control-Allow-Methods': 'POST,OPTIONS,GET,HEAD',
                                    'Access-Control-Allow-Credentials': true,
                                    'Access-Control-Allow-Headers': '*'
                                },
                                "body": JSON.stringify({
                                    'username': username,
                                    'token': tokens.id_token,
                                    'mensaje': 'Aprovado'
                                })
                            })
                        }
                        else {
                            callback(null, {
                                "statusCode": 500,
                                "headers": {
                                    "Content-type": "application/json", 'Access-Control-Allow-Origin': '*',
                                    'Access-Control-Allow-Methods': 'POST,OPTIONS,GET,HEAD',
                                    'Access-Control-Allow-Credentials': true,
                                    'Access-Control-Allow-Headers': '*'
                                },
                                body: JSON.stringify({
                                    message: "El usuario pertenece a otra empresa"
                                })
                            })
                        }
                    }
                });

            },
            onFailure: function (err) {
                console.log("Ha ocurrido un error en el login del usuario: " + username + "\n" + err);
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
            },
            newPasswordRequired: function () {
                console.log("El usuario " + username + " requiere cambio de password");
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
                        'mensaje': 'ChangePassword'
                    })
                })
            }
        })
    }
    catch (err) {
        var errores = []
        errores.push(`Ha ocurrido un error en el login del usuario: ${err}`);
        console.log("Ha ocurrido un error en el login del usuario: " + username + "\n" + err);
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
