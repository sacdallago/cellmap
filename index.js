/**
 * Entry point
 *
 * Created by Christian Dallago on 20160416 .
 */


var context;

module.exports = {
    start: function(callback) {
        callback = callback || function(){};

        // Imports
        const mongoose          = require('mongoose');
        const fs                = require('fs');
        const path              = require('path');
        const q                 = require('q');
        const formidable        = require('formidable');

        // Initialize the context
        context = {
            fs              : fs,
            mongoose        : mongoose,
            path            : path,
            promises        : q,
            formidable      : formidable,
            gridFs          : {},
            constants       : {}
        };

        // Function to load all components from the respective folders (models, controllers, services, daos, utils)
        context.component = function(componentName) {
            if (!context[componentName]) {
                context[componentName] = {};
            }

            return {
                module: function(moduleName) {
                    if (!context[componentName][moduleName]) {
                        console.log('Loading component ' + componentName);
                        context[componentName][moduleName] = require(path.join(__dirname, componentName, moduleName))(context,
                                                                                                                      componentName, moduleName);
                        console.log('LOADED ' + componentName + '.' + moduleName);
                    }

                    return context[componentName][moduleName];
                }
            }
        };

        callback(context);
        return context;
    },
    connect: function(callback){
        const context   = this.start();
        const gridFs    = require('gridfs-stream');
        const config    = require(__dirname + "/config");
        
        context.config  = config;

        //Create the DB connection string
        var databaseParams = config.database;
        var dbConnection = "mongodb://";
        if (databaseParams.username && databaseParams.password  && databaseParams.username.length > 0 && databaseParams.password.length > 0) {
            dbConnection += databaseParams.username + ":" + databaseParams.password + "@";
        }
        dbConnection += databaseParams.uri + ":" + databaseParams.port + "/" + databaseParams.collection;

        dbConnection += (databaseParams.ssl !== undefined && databaseParams.ssl === true) ? "?ssl=true" : "";
        
        context.mongoConnectionString = dbConnection;

        console.log("Connecting to " + context.mongoConnectionString);

        context.mongoose.connect(dbConnection);
        var db = context.mongoose.connection;

        // CONNECTION EVENTS: When successfully connected
        db.on('connected', function () {
            console.log('Mongoose connected');
        });

        // If the connection throws an error
        db.on('error', function (err) {
            console.log('Mongoose default connection error: ' + err);
            return process.exit(1);
        });

        // When the connection is disconnected
        db.on('disconnected', function () {
            console.log('Mongoose default connection disconnected');
            return process.exit(1);
        });

        db.on('open', function () {
            context.gridFs = gridFs(db.db, context.mongoose.mongo);
            return callback(context);
        });
    }
}
