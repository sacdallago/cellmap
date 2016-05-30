/**
 * interactions DAO
 *
 * Created by Christian Dallago on 20160530 .
 */

module.exports = function(context) {

    // Imports
    var interactionModel = context.component('models').module('interactions');

    return {
        create: function(item) {
            var deferred = context.promises.defer();

            interactionModel.create(item, function(error, insertedItem) {
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

            interactionModel.update({ approvedsymbol: item.approvedsymbol }, item, {
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