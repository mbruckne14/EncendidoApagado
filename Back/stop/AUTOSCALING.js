const AWS = require('aws-sdk');


class AUTOSCALING {

    constructor() {
        this.errores = [];
        var self = this;
        this.autoscaling = new AWS.AutoScaling();

        this.ApagarTodo = async function () {
            try {
                var autoscalingPromise = await this.autoscaling.describeAutoScalingGroups().promise();
            }
            catch (err) {
                self.errores.push(`Ha ocurrido un error al listar recursos Autoscaling: ${err}`);
                console.log("Ha ocurrido un error al listar recursos Autoscaling: ", err);
            }
            if (autoscalingPromise) {
                for (var asg of autoscalingPromise.AutoScalingGroups) {
                    try {
                        await this.Apagar(asg['AutoScalingGroupName']);
                    } catch (err) {
                        self.errores.push(`Ha ocurrido un error al apagar recursos Autoscaling: ${err}`);
                        console.log("Ha ocurrido un error al apagar recursos Autoscaling: ", err);
                    }
                }
            }
        };

        this.EncenderTodo = async function () {
            try {
                var autoscalingPromise = await this.autoscaling.describeAutoScalingGroups().promise();
            }
            catch (err) {
                self.errores.push(`Ha ocurrido un error al listar recursos Autoscaling: ${err}`);
                console.log("Ha ocurrido un error al listar recursos Autoscaling: ", err);
            }
            if (autoscalingPromise) {
                for (var asg of autoscalingPromise.AutoScalingGroups) {
                    try {
                        await this.Encender(asg['AutoScalingGroupName']);
                    } catch (err) {
                        self.errores.push(`Ha ocurrido un error al encender recursos Autoscaling: ${err}`);
                        console.log("Ha ocurrido un error al encender recursos Autoscaling: ", err);
                    }
                }
            }
        };

        this.Apagar = async function (asg_name) {
            var params = {
                AutoScalingGroupName: asg_name,
                MaxSize: 0,
                MinSize: 0
            };
            try {
                var updateAutoScalingGroupPromise = await this.autoscaling.updateAutoScalingGroup(params).promise();
            } catch (err) {
                self.errores.push(`Ha ocurrido un error al apagar el recurso Autoscaling: ${err}`);
                console.log("Ha ocurrido un error al apagar el recurso Autoscaling: ", err);
            }
            if (updateAutoScalingGroupPromise) {
                console.log("Recurso Autoscaling apagado exitosamente: ", updateAutoScalingGroupPromise);
            }
        };

        this.Encender = async function (asg_name) {
            var params = {
                AutoScalingGroupName: asg_name,
                MaxSize: 1,
                MinSize: 1
            };
            try {
                var updateAutoScalingGroupPromise = await this.autoscaling.updateAutoScalingGroup(params).promise();
            } catch (err) {
                self.errores.push(`Ha ocurrido un error al encender el recurso Autoscaling: ${err}`);
                console.log("Ha ocurrido un error al encender el recurso Autoscaling: ", err);
            }
            if (updateAutoScalingGroupPromise) {
                console.log("Recurso Autoscaling encendido exitosamente: ", updateAutoScalingGroupPromise);
            }
        };

        this.ApagarPorTag = async function (tag_name, tag_value) {
            try {
                var autoscalingPromise = await this.autoscaling.describeAutoScalingGroups().promise();
            } catch (err) {
                self.errores.push(`Ha ocurrido un error al listar recursos Autoscaling: ${err}`);
                console.log("Ha ocurrido un error al listar recursos Autoscaling: ", err);
            }
            if (autoscalingPromise) {
                var iterations = [];
                var resources = [];
                for (var asg of autoscalingPromise.AutoScalingGroups) {
                    try {
                        if (iterations.indexOf(asg['AutoScalingGroupName']) < 0) {
                            iterations.push(asg['AutoScalingGroupName']);
                            var autoscalingTagPromise = await this.autoscaling.describeTags().promise();
                        }
                    } catch (err) {
                        self.errores.push(`Ha ocurrido un error al listar los tags del recurso Autoscaling: ${err}`);
                        console.log("Ha ocurrido un error al listar los tags del recurso Autoscaling: ", err);
                    }
                    if (autoscalingTagPromise) {
                        for (var tag of autoscalingTagPromise.Tags) {
                            try {
                                if (resources.indexOf(tag['ResourceId']) < 0) {
                                    resources.push(tag['ResourceId']);
                                    if (tag['Key'] == tag_name && tag['Value'] == tag_value) {
                                        await this.Apagar(tag['ResourceId']);
                                    }
                                }
                            } catch (err) {
                                self.errores.push(`Ha ocurrido un error al apagar el recurso Autoscaling: ${err}`);
                                console.log("Ha ocurrido un error al apagar el recurso Autoscaling: ", err);
                            }

                        }
                    }
                }
            }
        };

        this.EncenderPorTag = async function (tag_name, tag_value) {
            try {
                var autoscalingPromise = await this.autoscaling.describeAutoScalingGroups().promise();
            } catch (err) {
                self.errores.push(`Ha ocurrido un error al listar recursos Autoscaling: ${err}`);
                console.log("Ha ocurrido un error al listar recursos Autoscaling: ", err);
            }
            if (autoscalingPromise) {
                var iterations = [];
                var resources = [];
                for (var asg of autoscalingPromise.AutoScalingGroups) {
                    try {
                        if (iterations.indexOf(asg['AutoScalingGroupName']) < 0) {
                            iterations.push(asg['AutoScalingGroupName']);
                            var autoscalingTagPromise = await this.autoscaling.describeTags().promise();
                        }
                    } catch (err) {
                        self.errores.push(`Ha ocurrido un error al listar los tags del recurso Autoscaling: ${err}`);
                        console.log("Ha ocurrido un error al listar los tags del recurso Autoscaling: ", err);
                    }
                    if (autoscalingTagPromise) {
                        for (var tag of autoscalingTagPromise.Tags) {
                            try {
                                if (resources.indexOf(tag['ResourceId']) < 0) {
                                    resources.push(tag['ResourceId']);
                                    if (tag['Key'] == tag_name && tag['Value'] == tag_value) {
                                        await this.Encender(tag['ResourceId']);
                                    }
                                }
                            } catch (err) {
                                self.errores.push(`Ha ocurrido un error al encender el recurso Autoscaling: ${err}`);
                                console.log("Ha ocurrido un error al encender el recurso Autoscaling: ", err);
                            }

                        }
                    }
                }
            }
        };
    }
}

exports.AUTOSCALINGFactory = function () {

    this.create = function () {
        return new AUTOSCALING();
    }
}