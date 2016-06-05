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
        
        bulkInsert: function(items) {
            var deferred = context.promises.defer();

            mappingsModel.collection.insert(items, function(error, insertedItems) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                }
                deferred.resolve(insertedItems);
            });

            return deferred.promise;
        },

        findProteinNames: function(identifier) {
            var deferred = context.promises.defer();

            mappingsModel.findOne({
                $or: [
                    {uniprotId:  identifier},
                    {geneId: identifier},
                    {entryName: identifier}
                ]
            })
                .exec(function(error, result) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                } else {
                    deferred.resolve(result);
                }
            });

            return deferred.promise;
        },
        
        findByUniprotId: function(identifier) {
            var deferred = context.promises.defer();

            mappingsModel.findOne({uniprotId:  identifier})
                .exec(function(error, result) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                } else {
                    deferred.resolve(result);
                }
            });

            return deferred.promise;
        },
        
        findProteinNames: function(identifier) {
            var deferred = context.promises.defer();

            mappingsModel.find({
                $or: [
                    {uniprotId: {'$regex': identifier}},
                    {entryName: {'$regex': identifier}},
                    {geneName: {'$regex': identifier}}
                ]
            })
                .limit(10)
                .exec(function(error, results) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                } else {
                    deferred.resolve(results);
                }
            });

            return deferred.promise;
        },
    };
};