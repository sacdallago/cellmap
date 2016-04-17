/**
 * expressionLigRec DAO
 *
 * Created by Christian Dallago on 20160417 .
 */

module.exports = function(context) {

    // Imports
    var pairsLigRec = context.component('models').module('pairsLigRec');

    return {
        create: function(item) {
            var deferred = context.promises.defer();

            pairsLigRec.create(item, function(error, insertedItem) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                }
                deferred.resolve(insertedItem);
            });

            return deferred.promise;
        },
        
        update: function(item) {
            var deferred = context.promises.defer();
            
            item.updatedAt = Date.now();

            pairsLigRec.update({ "pair_name": item.pair_name }, item, {
                upsert: true,
                setDefaultsOnInsert : true
            }, function(error, insertedItem) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                }
                deferred.resolve(insertedItem);
            });

            return deferred.promise;
        },
    };
};