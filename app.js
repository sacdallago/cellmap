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
    const express           = require('express');
    const cookieParser      = require('cookie-parser')
    const path              = require('path');
    const compression       = require('compression');
    const watch             = require('node-watch');
    const passport          = require('passport');
    const googleStrategy    = require('passport-google-oauth2').Strategy;
    const universalAnalytics= require('universal-analytics');
    const session           = require('express-session');
    const MongoStore        = require('connect-mongo')(session);


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

        // Define application address
        const address = function(config){
            var address = "";

            if(config.application){
                address    += config.application.protocol || "http";
                address    += "://";
                address    += config.application.hostname || "localhost";
                address    += config.application.port !== undefined ? ":" : "";
                address    += config.application.port || "";
            } else {
                address    += "http://localhost:3000";
            }

            return address;
        }(context.config);

        // Define application
        const app = express();

        // Express configuration
        app.set('port', process.env.PORT || 3000);
        app.set('views', path.join(__dirname, "views"));
        app.set('view engine', 'pug');

        // Use
        app.use(compression());
        app.use(cookieParser());
        app.use(session({
            secret: context.config.sessionSecret || 'catLolLog',
            store: new MongoStore({
                url: context.mongoConnectionString
            }),
            resave: true,
            saveUninitialized: true
        }));
        // Append google analytics user id. Will track both page visits as well as API calls.
        if(context.config.analytics && context.config.analytics.google && context.config.analytics.google.trackingId){
            app.use(universalAnalytics.middleware(context.config.analytics.google.trackingId, {cookieName: 'gauid'}));
        }
        app.use(passport.initialize());
        app.use(passport.session());

        // Configure passport
        const userDao = context.component('daos').module('users');
        const google = new googleStrategy({
            clientID            : context.config.passport.google.clientId,
            clientSecret        : context.config.passport.google.clientSecret,
            callbackURL         : address + "/auth/google/callback",
            passReqToCallback   : true
        }, function(request, accessToken, refreshToken, profile, done) {
            userDao.findOrCreate({ googleId: profile.id })
                .then(function(user){
                return done(null, user);
            }, function(error){
                return done(error, null);
            });
        });

        passport.use(google);

        passport.serializeUser(function(user, done) {
            userDao.findOrCreate(user)
                .then(function(user){
                return done(null, user.googleId);
            }, function(error){
                return done(error, null);
            });
        });

        passport.deserializeUser(function(user, done) {
            userDao.findByGoogleId(user)
                .then(function(user){
                return done(null, user);
            }, function(error){
                return done(error, null);
            });
        });

        app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

        app.get('/auth/logout', function(request, response){
            request.logout();
            response.redirect('/');
        });

        app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/error' }), function(request, response) {
            // Successful authentication, redirect home.
            response.redirect('/');
        });

        // Export static folders
        app.use("/public", express.static(path.join(__dirname, "public")));

        // Create routers
        context.router = new express.Router();
        context.api = new express.Router();

        // Router listens on / and /api
        app.use('/api', function(request, response, next) {
            // Send API request to google analytics
            request.visitor.pageview(request.path).send();
            return next();
        }, context.api);
        
        app.use('/', context.router);

        if(process.env.NODE_ENV != 'production'){
            context.router.use(function(request, response, next) {
                // Log each request to the console if in dev mode
                console.log("Method:", request.method, "Path", request.path, "Query", request.query);

                return next();
            });
        }

        // Load all routes
        context.component('.').module('routes');

        // Global variables:
        const localizationDao = context.component('daos').module('localizations');
        localizationDao.getLocalizations().then(function(localizations){
            context.constants.localizations = localizations;

            // Make the server listen
            app.listen(app.get('port'), function(){
                console.log("Express server listening on port ", app.get('port'));
                console.log("According to your configuration, the application is reachable at", address);
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