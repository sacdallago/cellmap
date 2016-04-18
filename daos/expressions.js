/**
 * expressionLigRec DAO
 *
 * Created by Christian Dallago on 20160416 .
 */

module.exports = function(context) {

    // Imports
    var expressionsModel = context.component('models').module('expressions');

    return {
        create: function(item) {
            var deferred = context.promises.defer();

            expressionsModel.create(item, function(error, insertedItem) {
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

            expressionsModel.update({ approvedsymbol: item.approvedsymbol }, item, {
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