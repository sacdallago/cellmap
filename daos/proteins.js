/**
 * proteins DAO
 *
 * Created by Christian Dallago on 20160611 .
 */

module.exports = function(context) {

    // Imports
    let proteinsModel = context.component('models').module('proteins');

    return {
        create: function(item) {
            let deferred = context.promises.defer();

            proteinsModel.create(item, function(error, insertedItem) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                }
                deferred.resolve(insertedItem);
            });

            return deferred.promise;
        },

        remove: function(item) {
            let deferred = context.promises.defer();

            proteinsModel.findOneAndRemove({_id: item._id}, function(error, removedItem) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                }
                deferred.resolve(removedItem);
            });

            return deferred.promise;
        },

        update: function(item) {
            let deferred = context.promises.defer();

            item.updatedAt = Date.now();

            proteinsModel.update({ "uniprotId": item.uniprotId }, item, {
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

        enrich: function(item) {
            let deferred = context.promises.defer();

            item.updatedAt = Date.now();

            proteinsModel.findOne({uniprotId:  item.uniprotId}, function(error, result) {
                    if (error) {
                        console.error(error);
                        deferred.reject(error);
                    } else {
                        // If no such element, add to db
                        if(result === null){
                            proteinsModel.create(item, function(error, insertedItem) {
                                if (error) {
                                    console.error(error);
                                    deferred.reject(error);
                                }
                                deferred.resolve(insertedItem);
                            });
                        } else {
                            item.interactions.partners = item.interactions.partners.concat(result.interactions.partners)
                            // Remove duplicates
                                .filter(function(element, index, self){
                                    return self.findIndex(function(current){
                                            return current.interactor === element.interactor;
                                        }) === index;
                                });

                            item.localizations.localizations = item.localizations.localizations.concat(result.localizations.localizations)
                            // Remove duplicates
                                .filter(function(item, pos, self) {
                                    return self.indexOf(item) === pos;
                                });

                            proteinsModel.update({"uniprotId": item.uniprotId}, item, {
                                upsert: false
                            }, function(error, insertedItem) {
                                if (error) {
                                    console.error(error);
                                    deferred.reject(error);
                                }
                                deferred.resolve(insertedItem);
                            });
                        }
                    }
                });

            return deferred.promise;
        },

        findByUniprotId: function(identifier) {
            let deferred = context.promises.defer();

            proteinsModel.findOne({uniprotId:  identifier})
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
            let deferred = context.promises.defer();

            proteinsModel.find({
                $or: [
                    {uniprotId: {'$regex': identifier}},
                    {entryName: {'$regex': identifier}},
                    {geneName: {'$regex': identifier}}
                ]
            })
                .limit(50)
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

        getPartners: function(protein){
            let deferred = context.promises.defer();

            proteinsModel.find({
                uniprotId: {
                    $in: protein.interactions.partners.map(function(interaction){return interaction.interactor})
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

        findProteins: function(proteinIdentifiers){
            let deferred = context.promises.defer();

            proteinsModel.find({
                uniprotId: {
                    $in: proteinIdentifiers
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

        getLocalizations: function() {
            let deferred = context.promises.defer();

            proteinsModel.find({},{
                "localizations": 1
            }, function(error, results) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                }

                let onlyLocalizations = [];

                results.forEach(function(element){
                    onlyLocalizations.push.apply(onlyLocalizations, element.localizations.localizations);
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