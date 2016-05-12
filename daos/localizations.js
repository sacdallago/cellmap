/**
 * expressionLigRec DAO
 *
 * Created by Christian Dallago on 20160417 .
 */

module.exports = function(context) {

    // Imports
    var localizationModel = context.component('models').module('localizations');

    return {
        create: function(item) {
            var deferred = context.promises.defer();

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
            var deferred = context.promises.defer();

            item.updatedAt = Date.now();

            localizationModel.update({ "approvedsymbol": item.approvedsymbol }, item, {
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
            var deferred = context.promises.defer();

            localizationModel.find({},{
                "consensus_sl": 1
            }, function(error, results) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                }

                var onlyLocalizations = []

                results.forEach(function(element){
                    var localizations = element.consensus_sl.split(". ");
                    onlyLocalizations.push.apply(onlyLocalizations, localizations);
                });

                onlyLocalizations = onlyLocalizations.filter(function(elem, pos) {
                    return onlyLocalizations.indexOf(elem) == pos;
                });
                
                onlyLocalizations.sort();

                deferred.resolve(onlyLocalizations);
            });

            return deferred.promise;
        }
    };
};