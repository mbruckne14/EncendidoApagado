const AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
const CLOUDWATCH = require('./CLOUDWATCH');

exports.getScheduleHandler = async function (event, context, callback) {
    var errores = [];
    var cloudWatchFactory = new CLOUDWATCH.CLOUDWATCHFactory();
    var reglaEncendido = process.env.REGLAENCENDIDO;
    var reglaApagado = process.env.REGLAAPAGADO;

    try {
        var cloudWatch = cloudWatchFactory.create();
        if (await cloudWatch.ReglaExiste(reglaEncendido)) {
            var respuesta = await cloudWatch.ObtenerProgramado(reglaEncendido, reglaApagado);
        }
        else {
            respuesta = { message: false };
        }
        callback(null,
            {
                "statusCode": 200,
                "headers": {
                    "Content-type": "application/json", 'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS,GET,HEAD',
                    'Access-Control-Allow-Credentials': true,
                    'Access-Control-Allow-Headers': '*'
                },
                "body": JSON.stringify({
                    respuesta
                })
            })
    }
    catch (e) {
        console.log("Ha ocurrido un error al obtener el programado: ", e);
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
                    'message': e.message
                })
            })
    }
    var errores = cloudWatch.errores;
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
