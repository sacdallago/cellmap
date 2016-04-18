/**
 * tissues DAO
 *
 * Created by Christian Dallago on 20160418 .
 */

module.exports = function(context) {

    // Imports
    var tissuesModel = context.component('models').module('tissues');

    return {
        create: function(item) {
            var deferred = context.promises.defer();

            tissuesModel.create(item, function(error, insertedItem) {
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

            tissuesModel.update({ "tissue_id": item.tissue_id }, item, {
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