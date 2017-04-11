/**
 * expressionLigRec DAO
 *
 * Created by Christian Dallago on 20160417 .
 */

module.exports = function(context) {

    // Imports
    let localizationModel = context.component('models').module('localizations');

    return {
        create: function(item) {
            let deferred = context.promises.defer();

            localizationModel.create(item, function(error, insertedItem) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                }
                deferred.resolve(insertedItem);
            });

            return deferred.promise;
        },

        update: function(item) {
            let deferred = context.promises.defer();

            item.updatedAt = Date.now();

            localizationModel.update({ "geneName": item.geneName }, item, {
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

        getLocalizations: function() {
            let deferred = context.promises.defer();

            localizationModel.find({},{
                "localizations": 1
            }, function(error, results) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                }

                let onlyLocalizations = [];

                results.forEach(function(element){
                    onlyLocalizations.push.apply(onlyLocalizations, element.localizations);
                });

                onlyLocalizations = onlyLocalizations.filter(function(elem, pos) {
                    return onlyLocalizations.indexOf(elem) == pos;
                });

                onlyLocalizations.sort();

                deferred.resolve(onlyLocalizations);
            });

            return deferred.promise;
        },

        findProteinNames: function(identifier) {
            let deferred = context.promises.defer();

            localizationModel.find({
                $or: [
                    {geneName: {'$regex': identifier}},
                    {uniprotId: {'$regex': identifier}}
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
        
        findByUniprotId: function(identifier) {
            let deferred = context.promises.defer();

            localizationModel.findOne({uniprotId:  identifier})
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
        
        findProteins: function(accNumbers) {
            let deferred = context.promises.defer();

            localizationModel.find({
                uniprotId: {
                    $in: accNumbers
                }
            })
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