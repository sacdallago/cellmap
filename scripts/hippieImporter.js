// Parallelize
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const interactionsSource = require(__dirname + "/../" + 'data/' + 'hippie.json');
const context = require(__dirname + "/../" + "index").connect(function(context){
    const interactionsDao = context.component('daos').module('interactions');
    const now = Date.now();

    if (cluster.isMaster) {
        var step = Math.ceil(interactionsSource.length/numCPUs);

        //Insert one test item to define mongoose schema

        interactionsDao.create({
            edges: ["test", "test2"],
            score: 0.5
        }).then(function(testItem){
            console.log("Ensured schema works, spawning workers");

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

            interactionsDao.remove(testItem).then(function(){
                console.log('Removed test item');
            });
        });


        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} ended`);
        });
    } else {

        var promises = [];

        if(interactionsSource){
            interactionsSource.slice(process.env.from, process.env.to).forEach(function(element){
                var deferred = context.promises.defer();
                promises.push(deferred.promise);

                var newobj = {
                    edges: [
                        element.val0,
                        element.val2
                    ],
                    score: parseFloat(element.val4),
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


    }
});