'use strict';

// Parallelize
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const consoleStamp = require('console-stamp');

if (cluster.isMaster) {
    // Setup timestamps for logging
    consoleStamp(console,{
        metadata: function () {
            return ("[MASTER]");
        },
        colors: {
            stamp: "yellow",
            label: "white",
            metadata: "red"
        }
    } );

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();
        console.log("Spwaning worker " + worker.id);
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        var newWorker = cluster.fork();
        console.log("Spwaning worker " + newWorker.id);
    });

} else {
    // Spawn various workers to listen and answer requests
    const express = require('express');
    const path = require('path');
    const compression = require('compression');
    const watch = require('node-watch');

    consoleStamp(console, {
        metadata: function () {
            return ("[Worker " + cluster.worker.id + "]");
        },
        colors: {
            stamp: "yellow",
            label: "white",
            metadata: "green"
        }
    } );

    // Make each worker connect to mongoose and startup the controllers
    require(path.join(__dirname, "index.js")).connect(function(context){
        const app = express();

        // Express configuration
        app.set('port', process.env.PORT || 3000);
        app.set('views', path.join(__dirname, "views"));
        app.set('view engine', 'jade');
        app.use(compression());

        // Export static folders
        app.use("/public", express.static(path.join(__dirname, "public")));

        // Create router
        context.router = new express.Router();

        // Router listens on /
        app.use('/', context.router);

        // Log all requests 
        context.router.use(function(request, response, next) {

            // Log each request to the console
            console.log(request.method, request.url);

            // Continue doing what we were doing and go to the route
            return next();
        });

        // Load all routes
        context.component('.').module('routes');

        // Global variables:
        const localizationDao = context.component('daos').module('localizations');
        localizationDao.getLocalizations().then(function(localizations){
            context.constants.localizations = localizations;

            // Make the server listen
            app.listen(app.get('port'), function(){
                console.log("Express server listening on port " + app.get('port'));
            });
        });
    });

    // Watch in case of file changes, restart worker (basically can keep up server running forever)
    watch([
        //path.join(__dirname, "views"),
        path.join(__dirname, "services"),
        path.join(__dirname, "controllers"),
        path.join(__dirname, "daos"),
        path.join(__dirname, "app.js"),
        path.join(__dirname, "index.js"),
    ], function(filename) {
        console.log('File changed. Worker is gonna perform harakiri.');
        cluster.worker.kill();
    });
}