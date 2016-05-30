/**
 * mappings DAO
 *
 * Created by Christian Dallago on 20160530 .
 */

module.exports = function(context) {

    // Imports
    var mappingsModel = context.component('models').module('mappings');

    return {
        create: function(item) {
            var deferred = context.promises.defer();

            mappingsModel.create(item, function(error, insertedItem) {
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

            mappingsModel.update({ uniprotId: item.uniprotId }, item, {
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