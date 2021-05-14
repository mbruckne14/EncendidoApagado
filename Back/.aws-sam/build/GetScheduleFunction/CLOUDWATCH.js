const AWS = require('aws-sdk');


class CLOUDWATCH {

    constructor() {
        this.errores = [];
        var self = this;
        this.cloudwatchevents = new AWS.CloudWatchEvents();

        this.Programado = async function (expresion, regla, descripcion, funcion, status) {
            var params = {
                Name: regla,
                Description: descripcion,
                ScheduleExpression: expresion,
                State: status
            };
            try {
                var putRulePromise = await this.cloudwatchevents.putRule(params).promise();
            } catch (err) {
                self.errores.push(`Ha ocurrido un error al programar recursos: ${err}`);
                console.log("Ha ocurrido un error al programar recursos: ", err); // an error occurred
            }
            if (putRulePromise) {
                var params = {
                    Rule: regla,
                    Targets: [
                        {
                            Arn: funcion,
                            Id: 'ProgramadoTarget',
                        }
                    ]
                };
                try {
                    var putTargetsPromise = await this.cloudwatchevents.putTargets(params).promise();
                } catch (err) {
                    self.errores.push(`Ha ocurrido un error al programar recursos: ${err}`);
                    console.log("Ha ocurrido un error al programar recursos: ", err);
                }
                if (putTargetsPromise) {
                    console.log("El programado tuvo exito: ", putTargetsPromise);
                }
            }
        };

        this.ObtenerProgramado = async function (nombreReglaEncendido, nombreReglaApagado) {
            try {
                var respuesta = {};
                var ReglaEncendido = await this.ObtenerRegla(nombreReglaEncendido);
                var ReglaApagado = await this.ObtenerRegla(nombreReglaApagado);
                var cronReglaEncendido = ReglaEncendido.cron;
                var cronReglaApagado = ReglaApagado.cron;

                var horaEncendido = this.ReverseMapUSEast(cronReglaEncendido[1]);
                var diasEncendido = cronReglaEncendido[4] === '?' ? [] : this.ReverseAjustarDia(horaEncendido, cronReglaEncendido[4].split(','));
                var horaApagado = this.ReverseMapUSEast(cronReglaApagado[1]);
                var diasApagado = cronReglaApagado[4] === '?' ? [] : this.ReverseAjustarDia(horaApagado, cronReglaApagado[4].split(','));
                respuesta = {
                    timeEncendido: { hour: horaEncendido, minute: cronReglaEncendido[0], second: '0' }, diasEncendido: diasEncendido,
                    timeApagado: { hour: horaApagado, minute: cronReglaApagado[0], second: '0' }, diasApagado: diasApagado,
                    statusEncendido: ReglaEncendido.status,
                    statusApagado: ReglaApagado.status
                }
                return respuesta;
            } catch (err) {
                self.errores.push(`Ha ocurrido un error al obtener programado: ${err}`);
                console.log("Ha ocurrido un error al obtener programado: ", err);
            }
        };

        this.ObtenerRegla = async function (regla) {
            try {
                var params = {
                    Name: regla
                };
                var cron = await this.cloudwatchevents.describeRule(params).promise();
            } catch (err) {
                self.errores.push(`Ha ocurrido un error al obtener la regla de programado: ${err}`);
                console.log("Ha ocurrido un error al obtener la regla de programado: ", err);
                return err.message;
            }
            if (cron) {
                var regExp = /\(([^)]+)\)/;
                var matches = regExp.exec(cron.ScheduleExpression);
                var res = matches[1].split(" ");
                console.log("Regla de programado ha sido obtenida exitosamente: ", cron);
                return { cron: res, status: cron.State };
            }
        };

        this.ReglaExiste = async function (rule) {
            try {
                var params = {
                    NamePrefix: rule
                };
                var reglas = await this.cloudwatchevents.listRules(params).promise();
            } catch (errr) {
                self.errores.push(`Ha ocurrido un error al listar las reglas de programado: ${err}`);
                console.log("Ha ocurrido un error al listar las reglas de programado: ", err);
            }
            if (reglas) {
                if (reglas.Rules.length !== 0) {
                    return true;
                }
                else return false;
            }
            return false;
        };

        this.CrearExpresion = function (time, dias) {
            try {
                var hora = this.MapUSEast(time.hour.toString());
                if (dias.length !== 0) {
                    var diasAjustado = this.AjustarDia(hora, dias);
                    return 'cron(' + time.minute.toString() + ' ' + hora + ' ? * ' + diasAjustado.toString() + ' *)';
                }
                else {
                    return 'cron(' + time.minute.toString() + ' ' + hora + ' 1 * ? 1970)';
                }
            } catch (err) {
                self.errores.push(`Ha ocurrido un error al crear expresion de programado: ${err}`);
                console.log("Ha ocurrido un error al crear expresion de programado: ", err);
            }
        };

        this.StatusProgramado = function (dias) {
            if (dias.length !== 0) {
                return 'ENABLED';
            }
            else {
                return 'DISABLED';
            }
        };

        this.MapUSEast = function (hour) {
            switch (hour) {
                case '6': return '11';
                case '7': return '12'
                case '8': return '13'
                case '9': return '14'
                case '10': return '15'
                case '11': return '16'
                case '12': return '17'
                case '13': return '18'
                case '14': return '19'
                case '15': return '20'
                case '16': return '21'
                case '17': return '22'
                case '18': return '23'
                case '19': return '0'
                case '20': return '1'
                case '21': return '2'
                case '22': return '3'
                case '23': return '4'
                case '0': return '5'
                case '1': return '6'
                case '2': return '7'
                case '3': return '8'
                case '4': return '9'
                case '5': return '10'
                default: return ''
            }
        };

        this.ReverseMapUSEast = function (hour) {
            switch (hour) {
                case '11': return '6';
                case '12': return '7'
                case '13': return '8'
                case '14': return '9'
                case '15': return '10'
                case '16': return '11'
                case '17': return '12'
                case '18': return '13'
                case '19': return '14'
                case '20': return '15'
                case '21': return '16'
                case '22': return '17'
                case '23': return '18'
                case '0': return '19'
                case '1': return '20'
                case '2': return '21'
                case '3': return '22'
                case '4': return '23'
                case '5': return '0'
                case '6': return '1'
                case '7': return '2'
                case '8': return '3'
                case '9': return '4'
                case '10': return '5'
                default: return ''
            }
        };

        this.AjustarDia = function (hora, dias) {
            try {
                if (parseInt(hora) <= 4) {
                    for (var i = 0; i < dias.length; i++) {
                        if (dias[i] != '7')
                            dias[i] = (parseInt(dias[i]) + 1).toString();
                        else
                            dias[i] = '1'
                    }
                }
                return dias;
            } catch (err) {
                self.errores.push(`Ha ocurrido un error al ajustar dia de programado: ${err}`);
                console.log("Ha ocurrido un error al ajustar dia de programado: ", err);
            }
        };

        this.ReverseAjustarDia = function (hora, dias) {
            try {
                if (parseInt(hora) >= 19) {
                    for (var i = 0; i < dias.length; i++) {
                        if (dias[i] != '1')
                            dias[i] = (parseInt(dias[i]) - 1).toString();
                        else
                            dias[i] = '7'
                    }
                }
                return dias;
            } catch (err) {
                self.errores.push(`Ha ocurrido un error al ajustar dia de programado: ${err}`);
                console.log("Ha ocurrido un error al ajustar dia de programado: ", err);
            }
        };
    }
}

exports.CLOUDWATCHFactory = function () {

    this.create = function () {
        return new CLOUDWATCH();
    }
}