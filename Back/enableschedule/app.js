
const AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
const CLOUDWATCH = require('./CLOUDWATCH');


exports.enableScheduleHandler = async function (event, context, callback) {
    var errores = [];
    var cloudWatchFactory = new CLOUDWATCH.CLOUDWATCHFactory();
    var diasEncendido = JSON.parse(event.body)["diasEncendido"];
    var diasApagado = JSON.parse(event.body)["diasApagado"];
    var timeEncendido = JSON.parse(event.body)["timeEncendido"];
    var timeApagado = JSON.parse(event.body)["timeApagado"];
    var reglaEncendido = process.env.REGLAENCENDIDO;
    var reglaApagado = process.env.REGLAAPAGADO;
    var funcionEncendido = process.env.STARTFUNCTION;
    var funcionApagado = process.env.STOPFUNCTION;
    var descripcionEncendido = process.env.DESCRIPCIONENCENDIDO;
    var descripcionApagado = process.env.DESCRIPCIONAPAGADO;


    try {
        var cloudWatch = cloudWatchFactory.create();
        //Genero la Expresion CRON 
        var expressionTurnOn = cloudWatch.CrearExpresion(timeEncendido, diasEncendido);
        var statusTurnOn = cloudWatch.StatusProgramado(diasEncendido);
        var expressionTurnOff = cloudWatch.CrearExpresion(timeApagado, diasApagado);
        var statusTurnOff = cloudWatch.StatusProgramado(diasApagado);
        //Progamado de Encendido
        await cloudWatch.Programado(expressionTurnOn, reglaEncendido, descripcionEncendido, funcionEncendido, statusTurnOn);
        //Programado de Apagado
        await cloudWatch.Programado(expressionTurnOff, reglaApagado, descripcionApagado, funcionApagado, statusTurnOff);
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
                    'message': 'El habilitado de programado de recursos ha sido exitoso',
                    'statusEncendido': statusTurnOn,
                    'statusApagado': statusTurnOff
                })
            })
    }
    catch (e) {
        console.log("Ha ocurrido un error al habilitar el programado: ", e);
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
