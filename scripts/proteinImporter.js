// Parallelize
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const subcellLocAgesProteinsSource = require(__dirname + "/../" + 'data/' + 'SubcelLoc.Ages.Proteins.json');
const interactionsSource = require(__dirname + "/../" + 'data/' + 'hippie.json');
const mappingSource = require(__dirname + "/../" + 'data/' + 'proteinMapping.json');


if (cluster.isMaster && !process.env.NOPARALLEL) {
    var step = Math.ceil(subcellLocAgesProteinsSource.length/numCPUs);
    var count = numCPUs;

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
        if(--count == 0){
            console.log('All ended. dying');
        }
    });
} else {
    const context = require(__dirname + "/../" + "index").connect(function(context){
        var promises = [];

        // Riken Ligand/Receptor Expression data
        const proteinsDao = context.component('daos').module('proteins');
        //const mappingDao = context.component('daos').module('mappings');

        if(subcellLocAgesProteinsSource){
            subcellLocAgesProteinsSource.slice(process.env.from || 0, process.env.to || subcellLocAgesProteinsSource.length).forEach(function(element){
                var deferred = context.promises.defer();
                promises.push(deferred.promise);

                var localizations = element.consensus_sl.split(". ");

                var protein = {
                    uniprotId: element.uniprotac,
                    geneName: element.approvedsymbol,
                    origin: "default",
                    localizations: {
                        localizations: localizations,
                        notes: "Data taken form original riken publication"
                    }
                };

                const mapping = mappingSource.find(function(mapping){
                    return mapping['entry'] == element.uniprotac;
                });

                if(mapping){
                    protein.entryName = mapping['entry name'];
                    protein.proteinName = mapping['protein names'].split(/\s\(/)[0];

                    var interactions = interactionsSource.filter(function(interaction){
                        if(interaction.val0 == protein.entryName){
                            return mappingSource.find(function(mapping){
                                return mapping['entry name'] == interaction.val2;
                            });
                        } else if(interaction.val2 == protein.entryName){
                            return mappingSource.find(function(mapping){
                                return mapping['entry name'] == interaction.val0;
                            });
                        } else {
                            return false;
                        }
                    });

                    if(interactions && interactions.length > 0){
                        interactions = interactions.map(function(interaction){
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
                        });

                        // Remove duplicates!
                        uniqueInteractions = [];
                        interactions.forEach(function(interaction){
                            if(!uniqueInteractions.find(function(element){
                                return element.interactor == interaction.interactor;
                            })) {
                                uniqueInteractions.push(interaction);
                            }
                        });

                        // Should always evaluate to true, but you never now
                        if(uniqueInteractions.length > 0){
                            protein.interactions = {
                                partners: uniqueInteractions,
                                notes: "Data from Hippie"
                            };
                        }
                    }
                }

                proteinsDao.update(protein).then(function(result){
                    console.log("[protein] Inserted " + protein.uniprotId);
                    deferred.resolve();
                }, function(error){
                    console.error("[protein] Error with " + protein.uniprotId);
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