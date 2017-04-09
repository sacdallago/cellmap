// Parallelize
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const subcellLocAgesProteinsSource = require(__dirname + "/../" + 'data/' + 'SubcelLoc.Ages.Proteins.json');
const interactionsSource = require(__dirname + "/../" + 'data/' + 'hippie.json');
const mappingSource = require(__dirname + "/../" + 'data/' + 'proteinMapping.json');


if (cluster.isMaster && !process.env.NOPARALLEL) {
    var step = Math.ceil(mappingSource.length/numCPUs);
    var count = numCPUs;

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

    cluster.on('exit', function(worker, code, signal){
        console.log("Worker " + worker.process.pid + " ended");
        if (--count === 0) {
            console.log('All ended. dying');
        }
    });
} else {
    require(__dirname + "/../" + "index").connect(function(context){
        var promises = [];

        // Riken Ligand/Receptor Expression data
        const proteinsDao = context.component('daos').module('proteins');
        //const mappingDao = context.component('daos').module('mappings');

        if(mappingSource){
            mappingSource.slice(process.env.from || 0, process.env.to || mappingSource.length).forEach(function(element){
                var deferred = context.promises.defer();
                promises.push(deferred.promise);

                var protein = {
                    uniprotId: element['entry'],
                    geneName: element['gene names'].split(/\s\(/)[0],
                    entryName: element['entry name'],
                    proteinName: element['protein names'].split(/\s\(/)[0],
                    origin: "default"
                };

                // keys[0] matches search query on uniprot mapping service, something like "yourlist:m2017040883c3dd8ce55183c76102dc5d3a26728bcb7727o"
                const originalMappingElementKey = Object.keys(element)[0];

                const localizationsMatch = subcellLocAgesProteinsSource.find(function(subcellLoc){
                    return subcellLoc.uniprotac == element[originalMappingElementKey];
                });

                if(localizationsMatch == undefined || localizationsMatch.length < 1){
                    console.error("[" + element[originalMappingElementKey] + "] Could not map back to localizations");
                }

                protein.localizations = {
                    localizations: localizationsMatch.consensus_sl.split(". "),
                    notes: "Data taken form original riken publication"
                };

                var interactions = interactionsSource
                    .filter(function(interaction){
                        if(interaction.val0 == protein.entryName){
                            // Make sure that also the partner exists in the mappings table
                            return mappingSource.find(function(mapping){
                                // If the partner exists, this evaluates to true, thus the complete interaction ( val0, val2, score) makes it into the interactors
                                return mapping['entry name'] == interaction.val2;
                            });
                        } else if(interaction.val2 == protein.entryName){
                            return mappingSource.find(function(mapping){
                                return mapping['entry name'] == interaction.val0;
                            });
                        } else {
                            return false;
                        }
                    })
                    // Map so that I only store partner and score
                    .map(function(interaction){
                        if(interaction.val0 == protein.entryName){
                            const interactor = mappingSource.find(function(mapping){
                                return mapping['entry name'] == interaction.val2;
                            });
                            return {
                                interactor: interactor['entry'],
                                score: parseFloat(interaction.val4)
                            };
                        } else {
                            const interactor = mappingSource.find(function(mapping){
                                return mapping['entry name'] == interaction.val0;
                            });
                            return {
                                interactor: interactor['entry'],
                                score: parseFloat(interaction.val4)
                            };
                        }
                    })
                    // Remove duplicates
                    .filter(function(element, index, self){
                        return self.findIndex(function(current){
                                return current.interactor === element.interactor;
                            }) === index;
                    });

                protein.interactions = {
                    partners: interactions,
                    notes: "Data from Hippie"
                };


                // console.log("[" + protein.uniprotId + "] Inserting..");
                proteinsDao.enrich(protein).then(function(result){
                    console.log("[" + protein.uniprotId + "] Inserted");
                    deferred.resolve();
                }, function(error){
                    console.error("[protein] Error with " + protein.uniprotId);
                    deferred.resolve();
                });

            });
        }

        context.promises.all(promises).then(function(results) {
            console.log("Finished.");
            process.exit(0);
        });

    });
}