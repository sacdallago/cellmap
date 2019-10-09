// Parallelize
const data = require(__dirname + "/../" + 'data/' + 'data.json');

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

            data.forEach(row => {
                let deferred = context.promises.defer();
                promises.push(deferred.promise);

                let protein = {
                    uniprotId: row['Entry'],
                    geneName: row['Gene names'],
                    entryName: row['Entry name'],
                    proteinName: row['Protein names'],
                    localizations: {
                        localizations: row['Consensus_SL'] || ["unknown"],
                        note: "Data from https://www.nature.com/articles/ncomms8866"
                    },
                    interactions: {
                        partners: row['partners'],
                        notes: "Data from HIPPIE (http://cbdm-01.zdv.uni-mainz.de/~mschaefer/hippie)"
                    },
                    origin: "Public data (https://github.com/sacdallago/cellmap/tree/develop/data)"
                };

                proteinsDao.create(protein).then(() => {
                    deferred.resolve({status: 0, protein: protein.uniprotId});
                }, (error) => {
                    deferred.resolve({status: -1, protein: protein.uniprotId, error: error});
                });
            });

            context.promises.all(promises).then(function(results) {
                let successful = results.filter(e => e.status === 0);
                let unsuccessful = results.filter(e => e.status !== 0);

                console.log("Finished with " + successful.length + " successful and " + unsuccessful.length + " unsuccessful inserts.");
                process.exit(0);
            });

        });
    });

});