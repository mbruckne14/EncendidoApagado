const AWS = require('aws-sdk');
global.fetch = require('node-fetch');

exports.messengerHandler = function (event, context, callback) {
      
    var errores = event.errores;
    var topicARN = process.env.TopicARN;
    try {
        if (Object.keys(errores).length !== 0) {
            var params = {
                Message: errores.join('\n'), /* required */
                TopicArn: topicARN
            };

            // Create promise and SNS service object
            var publishTextPromise = new AWS.SNS().publish(params).promise();

            // Handle promise's fulfilled/rejected states
            publishTextPromise.then(
                function (data) {
                    console.log(`Mensaje ${params.Message} enviado al tópico ${params.TopicArn}`);
                    console.log("MessageID es " + data.MessageId);
                }).catch(
                    function (err) {
                        console.log("Ha ocurrido un error al enviar mensaje: ", err);
                    });
        }
    }
    catch (err) {
        console.log("Ha ocurrido un error al enviar mensaje: ", err);
    }
};