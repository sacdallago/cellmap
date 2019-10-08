// Parallelize
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const csv = require('csv-parser');
const fs = require('fs');

require(__dirname + "/../" + "index").connect(function(context){

    const proteinsDao = context.component('daos').module('proteins');

    proteinsDao.create({
        uniprotId: "TEST",
        geneName: "TEST",
        entryName: "TEST",
        proteinName: "TEST",
        origin: "TEST"
    }).then(function(testItem){
        console.log("Ensured schema works");

        proteinsDao.remove(testItem).then(function(){
            console.log('Removed test item');
            let promises = [];

            fs.createReadStream(__dirname + "/../" + 'data/' + 'data.csv')
                .pipe(csv())
                .on('data', (row) => {
                    let deferred = context.promises.defer();
                    promises.push(deferred.promise);

                    let protein = {
                        uniprotId: row['Entry'],
                        geneName: row['Gene names'],
                        entryName: row['Entry name'],
                        proteinName: row['Protein names'],
                        localizations: {
                            localizations: row['Consensus_SL'].substring(1,row['Consensus_SL'].length-1).split(", "),
                            note: "Data from https://www.nature.com/articles/ncomms8866"
                        },
                        interactions: {
                            partners: JSON.parse(
                                row['partners']
                                    .replace(/\(/g,'[')
                                    .replace(/\)/g,']')
                                    .replace(/'/g, '\"')
                            )
                                .map(interaction => {
                                    return {
                                        interactor: interaction[0],
                                        score: interaction[1]
                                    }
                                }),
                            notes: "Data from HIPPIE (http://cbdm-01.zdv.uni-mainz.de/~mschaefer/hippie)"
                        },
                        origin: "Public data, see https://github.com/sacdallago/cellmap/tree/develop/data"
                    };

                    proteinsDao.enrich(protein).then(function(result){
                        console.log("[" + protein.uniprotId + "] Inserted");
                        deferred.resolve();
                    }, function(error){
                        console.error("[" + protein.uniprotId + "] Error");
                        deferred.resolve();
                    });

                })
                .on('end', () => {
                    console.log('CSV file successfully processed');

                    context.promises.all(promises).then(function(results) {
                        console.log("Finished.");
                        process.exit(0);
                    });
                });
        });
    });

});