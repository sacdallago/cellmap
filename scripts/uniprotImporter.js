// Parallelize
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const now = Date.now();
const context = require(__dirname + "/../" + "index").connect(function(context){
    const mappingDao = context.component('daos').module('mappings');

    // To get the file: 
    // 1. Take all "uniprot ACs" IDs from Riken data
    // 2. Paste here: http://www.uniprot.org/uploadlists/
    // 3. Map form UniProtKB AC/ID > UniProtKB
    // 4. Change columns and select: Emtry, Entry name, Protein names and Gene Names (primary)
    // 5. Download all results as Tab-separated
    // 6. Use parsjs (npm) to convert from TSV to JSON

    const mappingSource = require(__dirname + "/../" + 'data/' + 'proteinMapping.json');

    if (cluster.isMaster) {
        var step = Math.ceil(mappingSource.length/numCPUs);

        mappingDao.create({
            uniprotId: "test",
            entryName: "test",
            proteinName: "test",
            geneName: "test",
            origin: 'test'
        }).then(function(testItem){
            console.log("Ensured schema works, spawning workers");

            // Fork workers.
            for (var i = 0; i < numCPUs; i++) {
                var from = i*step;
                var to = ((i*step)+step > mappingSource.length ? mappingSource.length : (i*step)+step);
                var worker = cluster.fork({
                    from: from,
                    to: to
                });
                console.log("Spwaning worker " + worker.id);
            }
            
            mappingDao.remove(testItem).then(function(){
                console.log('Removed test item');
            });
        });



        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} ended`);
        });
    } else {

        var promises = [];

        if(mappingSource){
            mappingSource.slice(process.env.from, process.env.to).forEach(function(element){
                var deferred = context.promises.defer();
                promises.push(deferred.promise);

                /* Example of JSON:
                {"yourlist:m20160605c2335653e4fa1b8aecf5153189fa788f083ebax":"P04217","entry":"P04217","entry name":"A1BG_HUMAN","status":"reviewed","protein names":"Alpha-1B-glycoprotein (Alpha-1-B glycoprotein)","gene names":"A1BG","organism":"Homo sapiens (Human)","length":"495"},
                    */

                var newobj = {
                    uniprotId: element['entry'],
                    entryName: element['entry name'],
                    proteinName: element['protein names'].split(/\s\(/)[0],
                    geneName: element['gene names  (primary )'],
                    createdAt: now,
                    updatedAt: now,
                    origin: 'Uniprot'
                };

                deferred.resolve(newobj);
                console.log('Prepared ' + newobj.uniprotId);
            });
        }

        context.promises.all(promises).then(function(results) {
            mappingDao.bulkInsert(promises).then(function(result){
                console.log("[Mappings] Inserted ", process.env.from, process.env.to);
                console.log("Finished.");
                process.exit();
            }, function(error){
                console.error("[Mappings] Error: " + error, "With: ", process.env.from, process.env.to);
                console.log("Finished.");
                process.exit();
            });
        });
    }
});