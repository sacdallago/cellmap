// Parallelize
const numCPUs = (require('os').cpus().length) * 2;
const cluster = require('cluster');
const subcellLocAgesProteinsSource = require(__dirname + "/../" + 'data/' + 'SubcelLoc.Ages.Proteins.json');

if (cluster.isMaster) {
    var step = Math.ceil(subcellLocAgesProteinsSource.length/numCPUs);

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        var from = i*step;
        var to = ((i*step)+step > subcellLocAgesProteinsSource.length ? subcellLocAgesProteinsSource.length : (i*step)+step);
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

        // Riken Ligand/Receptor Expression data
        const subcellLocAgesProteinsDao = context.component('daos').module('localizations');
        //const mappingDao = context.component('daos').module('mappings');

        if(subcellLocAgesProteinsSource){
            subcellLocAgesProteinsSource.slice(process.env.from, process.env.to).forEach(function(element){
                var deferred = context.promises.defer();
                promises.push(deferred.promise);

                var localizations = element.consensus_sl.split(". ");

                var loc = {
                    localizations: localizations,
                    uniprotId: element.uniprotac,
                    geneName: element.approvedsymbol,
                    origin: 'Riken'
                }

                subcellLocAgesProteinsDao.update(loc).then(function(result){
                    console.log("[localizations] Inserted " + loc.geneName);
                    deferred.resolve();
                }, function(error){
                    console.error("[localizations] Error with " + loc.geneName);
                    deferred.resolve();
                });

            });
        }

        context.promises.all(promises).then(function(results) {
            console.log("Finished.");
            process.exit();
        });

    });
}