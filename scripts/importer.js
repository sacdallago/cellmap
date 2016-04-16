const config = require(__dirname + "/../" + "config");
const context = require(__dirname + "/../" + "index").start();

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

    // Riken Ligand/Receptor Expression data
    const expressionLigRecDao = context.component('daos').module('expressionLigRec');
    const expressionLigRecSource = require(__dirname + "/../" + '/data/' + 'ExpressionLigRec.json');

    var promises = [];

    expressionLigRecSource.forEach(function(element){
        var deferred = context.promises.defer();
        promises.push(deferred.promise);
        expressionLigRecDao.update(element).then(function(result){
            console.log("[ExpressionLigRec] Inserted " + element.approvedsymbol);
            deferred.resolve();
        }, function(error){
            console.error("[ExpressionLigRec] Error with " + element.approvedsymbol);
            deferred.resolve();
        });
    });


    context.promises.all(promises).then(function(results) {
        console.log("Finished.");
        process.exit();
    });

});