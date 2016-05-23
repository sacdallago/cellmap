/**
 * expressionLigRec DAO
 *
 * Created by Christian Dallago on 20160513 .
 */

module.exports = function(context) {

    // Imports
    var featuresModel = context.component('models').module('features');

    return {
        update: function(item) {
            var deferred = context.promises.defer();

            try{
                item.properties.updatedAt = Date.now();
            } catch(e){
                console.error(e);
                deferred.reject(e);
                return deferred.promise;
            }

            featuresModel.update({ "properties.map": item.properties.map, "properties.localization": item.properties.localization}, item, {
                upsert: true,
                setDefaultsOnInsert : true
            }, function(error, affected) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                } else {
                    featuresModel.findOne({ "properties.map": item.properties.map, "properties.localization": item.properties.localization}, function(error, results) {
                        if (error) {
                            console.error(error);
                            deferred.reject(error);
                        }
                        deferred.resolve(results);
                    });
                }
            });

            return deferred.promise;
        },

        remove: function(_id) {
            var deferred = context.promises.defer();

            featuresModel.remove({ "_id" : _id }, function(error, removedItem) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                }
                deferred.resolve(removedItem);
            });

            return deferred.promise;
        },

        find: function(map) {
            var deferred = context.promises.defer();

            featuresModel.find({ "properties.map": map}, function(error, results) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                }
                deferred.resolve(results);
            });

            return deferred.promise;
        },
    };
};