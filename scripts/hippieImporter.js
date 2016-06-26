// Parallelize
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const interactionsSource = require(__dirname + "/../" + 'data/' + 'hippie.json');
const mappingSource = require(__dirname + "/../" + 'data/' + 'proteinMapping.json');

const context = require(__dirname + "/../" + "index").connect(function(context){
    const interactionsDao = context.component('daos').module('interactions');
    const now = Date.now();

    if (cluster.isMaster) {
        var step = Math.ceil(interactionsSource.length/numCPUs);

        //Insert one test item to define mongoose schema

        interactionsDao.create({
            edges: ["test", "test2"],
            score: 0.5,
            origin: 'test'
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

        var interacitons = [];

        if(interactionsSource){
            interactionsSource.slice(process.env.from, process.env.to).forEach(function(element){

                var newobj = {
                    edges: [
                        element.val0,
                        element.val2
                    ],
                    score: parseFloat(element.val4),
                    createdAt: now,
                    updatedAt: now,
                    origin: 'Hippie'
                };

                var edge1 = mappingSource.find(function(mapping){
                    return mapping['entry name'] == newobj.edges[0];
                });
                
                var edge2 = mappingSource.find(function(mapping){
                    return mapping['entry name'] == newobj.edges[1];
                });

                if(edge1 && edge2){
                    interacitons.push(newobj);

                    console.log('Found mappings for interaction', newobj.edges);
                } else {
                    // console.log('No mapping data for interaciton', newobj.edges);
                }

            });

            interactionsDao.bulkInsert(interacitons).then(function(result){
                console.log("[Hippie] Inserted ", process.env.from, process.env.to);
                console.log("Finished.");
                process.exit();
            }, function(error){
                console.error("[Hippie] Error with insertion: " + error);
                console.log("Finished.");
                process.exit();
            });
        }
    }
});