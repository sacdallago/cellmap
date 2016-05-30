// Parallelize
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const interactionsSource = require(__dirname + "/../" + 'data/' + 'hippie.json');

if (cluster.isMaster) {
    var step = Math.ceil(interactionsSource.length/numCPUs);

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        var from = i*step;
        var to = ((i*step)+step > interactionsSource.length ? interactionsSource.length : (i*step)+step);
        var worker = cluster.fork({
            from: from,
            to: to
        });
        console.log("Spwaning worker " + worker.id);
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} ended`);
    });
} else {
        const context = require(__dirname + "/../" + "index").connect(function(context){
            var promises = [];
    
            // Hippie protein-protein interaction data
            const interactionsDao = context.component('daos').module('interactions');
    
            if(interactionsSource){
                interactionsSource.slice(process.env.from, process.env.to).forEach(function(element){
                    var deferred = context.promises.defer();
                    promises.push(deferred.promise);
    
                    // Lowering key cases (eg. TISSUE_NAME to tissue_name)
    
                    var key, keys = Object.keys(element);
                    var n = keys.length;
                    var newobj={}
                    while (n--) {
                        key = keys[n];
                        newobj[key.toLowerCase()] = element[key];
                    }
                    
                    deferred.resolve();
    
//                    interactionsDao.update(newobj).then(function(result){
//                        console.log("[Hippie] Inserted " + newobj.tissue_id);
//                        deferred.resolve();
//                    }, function(error){
//                        console.error("[Hippie] Error with " + newobj.tissue_id);
//                        deferred.resolve();
//                    });
                });
            }
    
            context.promises.all(promises).then(function(results) {
                console.log("Finished.");
                process.exit();
            });
    
        });
}