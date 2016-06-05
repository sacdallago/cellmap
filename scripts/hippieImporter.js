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
        const now = Date.now();

        if(interactionsSource){
            interactionsSource.slice(process.env.from, process.env.to).forEach(function(element){
                var deferred = context.promises.defer();
                promises.push(deferred.promise);

                var edge1 = element.val0;
                edge1 = edge1.replace(/_HUMAN/,'');
                var edge2 = element.val2;
                edge2 = edge2.replace(/_HUMAN/,'');

                var newobj = {
                    edges: [
                        edge1,
                        edge2
                    ],
                    score: element.val4,
                    createdAt: now,
                    updatedAt: now
                };
                
                deferred.resolve(newobj);
                console.log('Prepared ' + newobj.edges);
            });
        }

        context.promises.all(promises).then(function(results) {
            interactionsDao.bulkInsert(promises).then(function(result){
                console.log("[Hippie] Inserted ", process.env.from, process.env.to);
                console.log("Finished.");
                process.exit();
            }, function(error){
                console.error("[Hippie] Error with insertion: " + error);
                console.log("Finished.");
                process.exit();
            });
        });

    });
}