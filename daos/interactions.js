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

            interactionModel.update({ edges: item.edges }, item, {
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

        bulkInsert: function(items) {
            var deferred = context.promises.defer();

            interactionModel.collection.insert(items, function(error, insertedItems) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                }
                deferred.resolve(insertedItems);
            });

            return deferred.promise;
        },

        findByUniprotId: function(uniprotId) {
            var deferred = context.promises.defer();

            interactionModel
                .find({
                    edges: uniprotId
                })
                .exec(function(error, interactions) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                } else {
                    deferred.resolve(interactions);
                }
            });

            return deferred.promise;
        },
    };
};