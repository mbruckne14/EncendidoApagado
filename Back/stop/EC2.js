const AWS = require('aws-sdk');

class EC2 {

    constructor() {
        this.errores = [];
        var self = this;
        this.ec2 = new AWS.EC2();

        this.ApagarTodo = async function () {
            try {
                var instanciaPromise = await this.ec2.describeInstances().promise();
            }
            catch (err) {
                self.errores.push(`Ha ocurrido un error al listar recursos EC2: ${err}`)
                console.log("Ha ocurrido un error al listar recursos EC2: ", err);
            }
            if (instanciaPromise) {
                for (var reservation of instanciaPromise.Reservations) {
                    for (var instancias of reservation.Instances) {
                        try {
                            var params = {
                                InstanceIds: [
                                    instancias.InstanceId
                                ]
                            }
                            await this.Apagar(params, instancias.State.Name);
                        } catch (err) {
                            self.errores.push(`Ha ocurrido un error al apagar recursos EC2: ${err}`)
                            console.log("Ha ocurrido un error al apagar recursos EC2: ", err);
                        }
                    }
                }
            }
        };

        this.EncenderTodo = async function () {
            try {
                var instanciaPromise = await this.ec2.describeInstances().promise();
            }
            catch (err) {
                self.errores.push(`Ha ocurrido un error al listar recursos EC2: ${err}`)
                console.log("Ha ocurrido un error al listar recursos EC2: ", err);
            }
            if (instanciaPromise) {
                for (var reservation of instanciaPromise.Reservations) {
                    for (var instancias of reservation.Instances) {
                        try {
                            var params = {
                                InstanceIds: [
                                    instancias.InstanceId
                                ]
                            }
                            await this.Encender(params, instancias.State.Name);
                        } catch (err) {
                            self.errores.push(`Ha ocurrido un error al encender recursos EC2: ${err}`)
                            console.log("Ha ocurrido un error al encender recursos EC2: ", err);
                        }
                    }
                }
            }
        };

        this.Apagar = async function (instance_name, state) {
            if (state != "terminated") {
                try {
                    var stopInstancePromise = await this.ec2.stopInstances(instance_name).promise();
                } catch (err) {
                    self.errores.push(`Ha ocurrido un error al apagar el recurso EC2: ${err}`);
                    console.log("Ha ocurrido un error al apagar el recurso EC2: ", err);
                }
                if (stopInstancePromise) {
                    console.log("Recurso EC2 apagado exitosamente: ", stopInstancePromise);
                }
            }
        };

        this.Encender = async function (instance_name, state) {
            if (state != "terminated") {
                try {
                    var startInstancePromise = await this.ec2.startInstances(instance_name).promise();
                } catch (err) {
                    self.errores.push(`Ha ocurrido un error al encender el recurso EC2: ${err}`);
                    console.log("Ha ocurrido un error al encender el recurso EC2: ", err);
                }
                if (startInstancePromise) {
                    console.log("Recurso EC2 encendido exitosamente: ", startInstancePromise);
                }
            }
        };

        this.ApagarPorTag = async function (tag_name, tag_value) {
            var params = {
                Filters: [
                    {
                        Name: "tag:" + tag_name,
                        Values: [
                            tag_value
                        ]
                    },
                ],
            };
            try {
                var instanciaPromise = await this.ec2.describeInstances(params).promise();
            } catch (err) {
                self.errores.push(`Ha ocurrido un error al listar EC2 recursos por Tag:  ${err}`);
                console.log("Ha ocurrido un error al listar recursos EC2 por Tag: ", err);
            }
            if (instanciaPromise) {
                for (var reservation of instanciaPromise.Reservations) {
                    for (var instancias of reservation.Instances) {
                        try {
                            var params = {
                                InstanceIds: [
                                    instancias.InstanceId
                                ]
                            }
                            await this.Apagar(params);
                        } catch (err) {
                            self.errores.push(`Ha ocurrido un error al obtener instancias EC2 por tag: ${err}`);
                            console.log("Ha ocurrido un error al obtener instancias EC2 por tag: ", err);
                        }
                    }
                }

            }
        };

        this.EncenderPorTag = async function (tag_name, tag_value) {
            var params = {
                Filters: [
                    {
                        Name: "tag:" + tag_name,
                        Values: [
                            tag_value
                        ]
                    },
                ],
            };
            try {
                var instanciaPromise = await this.ec2.describeInstances(params).promise();
            } catch (err) {
                self.errores.push(`Ha ocurrido un error al listar recursos EC2 por Tag: ${err}`);
                console.log("Ha ocurrido un error al listar recursos EC2 por Tag: ", err);
            }
            if (instanciaPromise) {
                for (var reservation of instanciaPromise.Reservations) {
                    for (var instancias of reservation.Instances) {
                        try {
                            var params = {
                                InstanceIds: [
                                    instancias.InstanceId
                                ]
                            }
                            await this.Encender(params);
                        } catch (err) {
                            self.errores.push(`Ha ocurrido un error al obtener instancias EC2 por tag: ${err}`);
                            console.log("Ha ocurrido un error al obtener instancias EC2 por tag: ", err);
                        }
                    }
                }

            }
        };
    }
}
exports.EC2Factory = function () {

    this.create = function () {
        return new EC2();
    }
}

