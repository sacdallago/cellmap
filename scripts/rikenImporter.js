const context = require(__dirname + "/../" + "index").connect(function(context){
    var promises = [];


    // Riken Ligand/Receptor Expression data
    const expressionLigRecDao = context.component('daos').module('expressions');
    const pairsLigRecDao = context.component('daos').module('pairs');
    const subcellLocAgesProteinsDao = context.component('daos').module('localizations');

    const expressionLigRecSource = require(__dirname + "/../" + 'data/' + 'ExpressionLigRec.json');
    const pairsLigRecSource = require(__dirname + "/../" + 'data/' + 'PairsLigRec.json');
    const subcellLocAgesProteinsSource = require(__dirname + "/../" + 'data/' + 'SubcelLoc.Ages.Proteins.json');

    if(subcellLocAgesProteinsSource){
        subcellLocAgesProteinsSource.forEach(function(element){
            var deferred = context.promises.defer();
            promises.push(deferred.promise);
            subcellLocAgesProteinsDao.update(element).then(function(result){
                console.log("[subcellLocAgesProteinsSource] Inserted " + element.approvedsymbol);
                deferred.resolve();
            }, function(error){
                console.error("[subcellLocAgesProteinsSource] Error with " + element.approvedsymbol);
                deferred.resolve();
            });
        });
    }

    if(expressionLigRecSource){
        expressionLigRecSource.forEach(function(element){
            var deferred = context.promises.defer();
            promises.push(deferred.promise);
            expressionLigRecDao.update(element).then(function(result){
                console.log("[expressionLigRec] Inserted " + element.approvedsymbol);
                deferred.resolve();
            }, function(error){
                console.error("[expressionLigRec] Error with " + element.approvedsymbol);
                deferred.resolve();
            });
        });
    }

    if(pairsLigRecSource){
        pairsLigRecSource.forEach(function(element){
            var deferred = context.promises.defer();
            promises.push(deferred.promise);
            pairsLigRecDao.update(element).then(function(result){
                console.log("[pairsLigRec] Inserted " + element.pair_name);
                deferred.resolve();
            }, function(error){
                console.error("[pairsLigRec] Error with " + element.pair_name);
                deferred.resolve();
            });
        });
    }

    // Kuester tissue data
    const tissuesDao = context.component('daos').module('tissues');

    const tissuesSource = require(__dirname + "/../" + 'data/' + 'AllTissues.json');

    if(tissuesSource){
        tissuesSource.forEach(function(element){
            var deferred = context.promises.defer();
            promises.push(deferred.promise);

            // Lowering key cases (eg. TISSUE_NAME to tissue_name)

            var key, keys = Object.keys(element);
            var n = keys.length;
            var newobj={}
            while (n--) {
                key = keys[n];
                newobj[key.toLowerCase()] = obj[key];
            }

            tissuesDao.update(newobj).then(function(result){
                console.log("[tissues] Inserted " + element.pair_name);
                deferred.resolve();
            }, function(error){
                console.error("[tissues] Error with " + element.pair_name);
                deferred.resolve();
            });
        });
    }

    context.promises.all(promises).then(function(results) {
        console.log("Finished.");
        process.exit();
    });

});