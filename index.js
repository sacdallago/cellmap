/**
 * Entry point
 *
 * Created by Christian Dallago on 20160416 .
 */


var context;

module.exports = {
    start: function(callback) {
        callback = callback || function(){};

        const mongoose    = require('mongoose');
        const fs          = require('fs');
        const path        = require('path');
        const q           = require('q');

        // Initialize the context
        context = {
            fs              : fs,
            mongoose        : mongoose,
            path            : path,
            promises        : q,
            gridFs          : {}
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

        callback();
        return context;
    },
    connect: function(callback){
        const context   = this.start();
        const config    = require(__dirname + "/config");
        const gridFs    = require('gridfs-stream');

        //Create the DB connection string
        var databaseParams = config.database;
        var dbConnection = "mongodb://";
        if (databaseParams.username.length > 0 && databaseParams.password.length > 0) {
            dbConnection += databaseParams.username + ":" + databaseParams.password + "@";
        }
        dbConnection += databaseParams.uri + ":" + databaseParams.port + "/" + databaseParams.collection;

        context.mongoose.connect(dbConnection);
        var db = context.mongoose.connection;

        // CONNECTION EVENTS: When successfully connected
        db.on('connected', function () {
            console.log('Mongoose connected');
        });

        // If the connection throws an error
        db.on('error', function (err) {
            console.log('Mongoose default connection error: ' + err);
            process.exit(1);
        });

        // When the connection is disconnected
        db.on('disconnected', function () {
            console.log('Mongoose default connection disconnected');
            process.exit(1);
        });

        db.on('open', function () {
            context.gridFs = gridFs(db.db, context.mongoose.mongo);
            callback(context);
        });
    }
}