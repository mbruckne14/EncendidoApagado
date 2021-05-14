const AWS = require('aws-sdk');
const RDS = require('./RDS');
const EC2 = require('./EC2');
const APPSTREAM = require('./APPSTREAM');
const AUTOSCALING = require('./AUTOSCALING');
AWS.config.region = 'us-east-1';

exports.startHandler = async function (event, context, callback) {
    var recursos = [];
    var errores = [];
    var ec2 = new EC2.EC2Factory();
    var rds = new RDS.RDSFactory();
    var appstream = new APPSTREAM.APPSTREAMFactory();
    var autoscaling = new AUTOSCALING.AUTOSCALINGFactory();


    recursos.push(ec2.create());
    recursos.push(rds.create());
    recursos.push(appstream.create());
    recursos.push(autoscaling.create());

    try {
        for (var recurso of recursos) {
            if (event.httpMethod == 'POST') {
                var body = JSON.parse(event.body);
                await recurso.EncenderPorTag(body.tagName, body.tagValue);

                if (recurso.errores) {
                    errores = errores.concat(recurso.errores);
                }
            }
            else {

                await recurso.EncenderTodo();
                if (recurso.errores) {
                    errores = errores.concat(recurso.errores);
                }
            }
        }

        callback(null, {
            "statusCode": 200,
            "headers": {
                "Content-type": "application/json",
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,OPTIONS,GET,HEAD',
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Headers': '*'
            },
            "body": JSON.stringify({
                'message': 'Los recursos han sido encendidos exitosamente'
            })
        })
    }
    catch (err) {
        console.log("Ha ocurrido un error al encender recursos: ", err);
        callback(null, {
            "statusCode": 500,
            "headers": {
                "Content-type": "application/json",
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,OPTIONS,GET,HEAD',
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Headers': '*'
            },
            "body": JSON.stringify({
                'message': err.message
            })
        })
    }
    if (errores.length !== 0) {
        invokeErrorNotification(errores);
    }
};

function invokeErrorNotification(errores) {
    var functionName = process.env.MESSENGERFUNCTION;
    var lambda = new AWS.Lambda();
    var erroresObj = { errores: errores };
    var params = {
        FunctionName: functionName,
        InvokeArgs: JSON.stringify(erroresObj)
    };

    lambda.invokeAsync(params, function (err, data) {
        if (err) console.log("Ha ocurrido un error al llamar funcion de notificacion: ", err);
        else console.log(data);
    });
}
