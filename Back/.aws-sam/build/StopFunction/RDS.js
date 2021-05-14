const AWS = require('aws-sdk');

class RDS {

    constructor() {
        this.errores = [];
        var self = this;
        this.rds = new AWS.RDS();

        this.ApagarTodo = async function () {
            try {
                var instanciaDbPromise = await this.rds.describeDBInstances().promise();
            }
            catch (err) {
                self.errores.push(`Ha ocurrido un error al listar recursos RDS: ${err}`);
                console.log("Ha ocurrido un error al listar recursos RDS: ", err);
            }
            if (instanciaDbPromise) {
                for (var dbinstance of instanciaDbPromise.DBInstances) {
                    try {
                        var params = {
                            DBInstanceIdentifier: dbinstance.DBInstanceIdentifier
                        }
                        await this.Apagar(params, dbinstance.DBInstanceStatus);
                    }
                    catch (err) {
                        self.errores.push(`Ha ocurrido un error al apagar recurso RDS: ${err}`);
                        console.log("Ha ocurrido un error al apagar recurso RDS: ", err);
                    }
                }
            }
        };

        this.EncenderTodo = async function () {
            try {
                var instanciaDbPromise = await this.rds.describeDBInstances().promise();
            }
            catch (err) {
                self.errores.push(`Ha ocurrido un error al listar recursos RDS: ${err}`);
                console.log("Ha ocurrido un error al listar recursos RDS: ", err);
            }
            if (instanciaDbPromise) {
                for (var dbinstance of instanciaDbPromise.DBInstances) {
                    try {
                        var params = {
                            DBInstanceIdentifier: dbinstance.DBInstanceIdentifier
                        }
                        await this.Encender(params, dbinstance.DBInstanceStatus);
                    }
                    catch (err) {
                        self.errores.push(`Ha ocurrido un error al encender recurso RDS: ${err}`);
                        console.log("Ha ocurrido un error al encender recurso RDS: ", err);
                    }
                }
            }
        };

        this.Apagar = async function (db_instance_name, status) {
            if (status == 'available') {
                try {
                    var stopDbInstacePromise = await this.rds.stopDBInstance(db_instance_name).promise();
                } catch (err) {
                    self.errores.push(`Ha ocurrido un error al apagar recurso RDS: ${err}`);
                    console.log("Ha ocurrido un error al apagar el recurso RDS: ", err);
                }
                if (stopDbInstacePromise) {
                    console.log("Recurso RDS apagado exitosamente: ", stopDbInstacePromise);
                }

            }
        };

        this.Encender = async function (db_instance_name, status) {
            if (status == 'stopped') {
                try {
                    var startDbInstacePromise = await this.rds.startDBInstance(db_instance_name).promise();
                } catch (err) {
                    self.errores.push(`Ha ocurrido un error al encender recurso RDS: ${err}`);
                    console.log("Ha ocurrido un error al encender el recurso RDS: ", err);
                }
                if (startDbInstacePromise) {
                    console.log("Recurso RDS encendido exitosamente: ", startDbInstacePromise);
                }

            }
        };

        this.ApagarPorTag = async function (tag_name, tag_value) {
            var resourcegroupstaggingapi = new AWS.ResourceGroupsTaggingAPI();
            var params = {
                ExcludeCompliantResources: false,
                IncludeComplianceDetails: true,
                ResourceTypeFilters: [
                    'rds',
                ],
                TagFilters: [{
                    Key: tag_name,
                    Values: [
                        tag_value
                    ]
                }]
            };
            try {
                var recursosporTagPromise = await resourcegroupstaggingapi.getResources(params).promise();
            }
            catch (err) {
                self.errores.push(`Ha ocurrido un error al obtener recursos RDS por tag: ${err}`);
                console.log("Ha ocurrido un error al obtener recursos RDS por tag: ", err);
            }
            if (recursosporTagPromise) {
                for (var resourceTagMapping of recursosporTagPromise.ResourceTagMappingList) {
                    try {
                        var params = {
                            Filters: [{
                                Name: 'db-instance-id',
                                Values: [
                                    resourceTagMapping.ResourceARN
                                ]
                            }]
                        };
                        var instanciaDbPromise = await this.rds.describeDBInstances(params).promise();

                        var params = {
                            DBInstanceIdentifier: instanciaDbPromise.DBInstances[0].DBInstanceIdentifier
                        };
                        await this.Apagar(params, instanciaDbPromise.DBInstances[0].DBInstanceStatus);
                    }
                    catch (err) {
                        self.errores.push(`Ha ocurrido un error al obtener base de datos RDS por tag: ${err}`);
                        console.log("Ha ocurrido un error al obtener base de datos RDS por tag: ", err);
                    }
                }
            }
        };

        this.EncenderPorTag = async function (tag_name, tag_value) {
            var resourcegroupstaggingapi = new AWS.ResourceGroupsTaggingAPI();
            var params = {
                ExcludeCompliantResources: false,
                IncludeComplianceDetails: true,
                ResourceTypeFilters: [
                    'rds:db',
                ],
                TagFilters: [{
                    Key: tag_name,
                    Values: [
                        tag_value
                    ]
                }]
            };
            try {
                var recursosporTagPromise = await resourcegroupstaggingapi.getResources(params).promise();
            }
            catch (err) {
                self.errores.push(`Ha ocurrido un error al obtener recursos RDS por tag: ${err}`);
                console.log("Ha ocurrido un error al obtener recursos RDS por tag: ", err);
            }
            if (recursosporTagPromise) {
                for (var resourceTagMapping of recursosporTagPromise.ResourceTagMappingList) {
                    try {
                        var params = {
                            Filters: [{
                                Name: 'db-instance-id',
                                Values: [
                                    resourceTagMapping.ResourceARN
                                ]
                            }]
                        };
                        var instanciaDbPromise = await this.rds.describeDBInstances(params).promise();

                        var params = {
                            DBInstanceIdentifier: instanciaDbPromise.DBInstances[0].DBInstanceIdentifier
                        };
                        await this.Encender(params, instanciaDbPromise.DBInstances[0].DBInstanceStatus);
                    }
                    catch (err) {
                        self.errores.push(`Ha ocurrido un error al obtener base de datos RDS por tag: ${err}`);
                        console.log("Ha ocurrido un error al obtener base de datos RDS por tag: ", err);
                    }
                }
            }
        };
    }
}

exports.RDSFactory = function () {

    this.create = function () {
        return new RDS();
    };
};
