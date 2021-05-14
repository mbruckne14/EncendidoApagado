const AWS = require('aws-sdk');


class APPSTREAM {

    constructor() {
        this.errores = [];
        var self = this;
        this.appstream = new AWS.AppStream();

        this.ApagarTodo = async function () {
            try {
                var fleetPromise = await this.appstream.describeFleets().promise();
            } catch (err) {
                self.errores(`Ha ocurrido un error al listar recursos Appstream: ${err}`)
                console.log("Ha ocurrido un error al listar recursos Appstream: ", err);
            }
            if (fleetPromise) {
                for (var fleet of fleetPromise.Fleets) {
                    try {
                        var params = {
                            Name: fleet['Name']
                        }
                        await this.Apagar(params);
                    }
                    catch (err) {
                        self.errores(`Ha ocurrido un error al apagar recursos Appstream: ${err}`)
                        console.log("Ha ocurrido un error al apagar recursos Appstream: ", err);
                    }
                }
            }
        };

        this.EncenderTodo = async function () {
            try {
                var fleetPromise = await this.appstream.describeFleets().promise();
            } catch (err) {
                self.errores(`Ha ocurrido un error al listar recursos Appstream: ${err}`)
                console.log("Ha ocurrido un error al listar recursos Appstream: ", err);
            }
            if (fleetPromise) {
                for (var fleet of fleetPromise.Fleets) {
                    try {
                        var params = {
                            Name: fleet['Name']
                        }
                        await this.Encender(params);
                    }
                    catch (err) {
                        self.errores(`Ha ocurrido un error al encender recursos Appstream: ${err}`)
                        console.log("Ha ocurrido un error al encender recursos Appstream: ", err);
                    }
                }
            }
        };

        this.Apagar = async function (fleet_name) {
            try {
                var stopFleetPromise = await this.appstream.stopFleet(fleet_name).promise();
            } catch (err) {
                self.errores.push(`Ha ocurrido un error al apagar el recurso Appstream: ${err}`);
                console.log("Ha ocurrido un error al apagar el recurso Appstream: ", err);
            }
            if (stopFleetPromise) {
                console.log("Recurso Appstream apagado exitosamente: ", stopFleetPromise);
            }
        };

        this.Encender = async function (fleet_name) {
            try {
                var startFleetPromise = await this.appstream.startFleet(fleet_name).promise();
            } catch (err) {
                self.errores.push(`Ha ocurrido un error al encender el recurso Appstream: ${err}`);
                console.log("Ha ocurrido un error al encender el recurso Appstream: ", err);
            }
            if (startFleetPromise) {
                console.log("Recurso Appstream encendido exitosamente: ", startFleetPromise);
            }
        };

        this.ApagarPorTag = async function (tag_name, tag_value) {
            try {
                var fleetPromise = await this.appstream.describeFleets().promise();
            }
            catch (err) {
                self.errores.push(`Ha ocurrido un error al describir la flota de Appstream: " ${err}`);
                console.log("Ha ocurrido un error al describir la flota de Appstream: ", err, err.stack);
            }
            if (fleetPromise) {
                for (var fleet of fleetPromise.Fleets) {
                    try {
                        var params = {
                            ResourceArn: fleet['Arn']
                        }
                        var listTagsForResource = await this.appstream.listTagsForResource(params).promise();
                    } catch (err) {
                        self.errores.push(`Ha ocurrido un error al listar recursos de Appstream por Tag: " ${err}`);
                        console.log("`Ha ocurrido un error al listar recursos de Appstream por Tag: ", err);
                    }
                    if (listTagsForResource) {
                        try {
                            if (tag_name in listTagsForResource.Tags) {
                                if (listTagsForResource.Tags[tag_name] == tag_value) {
                                    var params = {
                                        Name: fleet['Name']
                                    }
                                    await this.Apagar(params);
                                }
                            }
                        }
                        catch (err) {
                            self.errores.push(`Ha ocurrido un error al apagar recursos de Appstream por Tag: " ${err}`);
                            console.log("Ha ocurrido un error al apagar recursos de Appstream por Tag: ", err);
                        }
                    }
                }
            }
        };

        this.EncenderPorTag = async function (tag_name, tag_value) {
            try {
                var fleetPromise = await this.appstream.describeFleets().promise();
            }
            catch (err) {
                self.errores.push(`Ha ocurrido un error al describir la flota de Appstream: " ${err}`);
                console.log("Ha ocurrido un error al describir la flota de Appstream: ", err, err.stack);
            }
            if (fleetPromise) {
                for (var fleet of fleetPromise.Fleets) {
                    try {
                        var params = {
                            ResourceArn: fleet['Arn']
                        }
                        var listTagsForResource = await this.appstream.listTagsForResource(params).promise();
                    } catch (err) {
                        self.errores.push(`Ha ocurrido un error al listar recursos de Appstream por Tag: " ${err}`);
                        console.log("`Ha ocurrido un error al listar recursos de Appstream por Tag: ", err);
                    }
                    if (listTagsForResource) {
                        try {
                            if (tag_name in listTagsForResource.Tags) {
                                if (listTagsForResource.Tags[tag_name] == tag_value) {
                                    var params = {
                                        Name: fleet['Name']
                                    }
                                    await this.Encender(params);
                                }
                            }
                        }
                        catch (err) {
                            self.errores.push(`Ha ocurrido un error al encender recursos de Appstream por Tag: " ${err}`);
                            console.log("Ha ocurrido un error al encender recursos de Appstream por Tag: ", err);
                        }
                    }
                }
            }
        };
    }
}
exports.APPSTREAMFactory = function () {

    this.create = function () {
        return new APPSTREAM();
    }
}