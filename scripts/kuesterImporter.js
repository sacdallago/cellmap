const context = require(__dirname + "/../" + "index").connect(function(context){
    var promises = [];

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
                newobj[key.toLowerCase()] = element[key];
            }

            tissuesDao.update(newobj).then(function(result){
                console.log("[tissues] Inserted " + newobj.tissue_id);
                deferred.resolve();
            }, function(error){
                console.error("[tissues] Error with " + newobj.tissue_id);
                deferred.resolve();
            });
        });
    }

    context.promises.all(promises).then(function(results) {
        console.log("Finished.");
        process.exit();
    });

});