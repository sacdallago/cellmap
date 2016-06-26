/**
 * users DAO
 *
 * Created by Christian Dallago on 20160626 .
 */

module.exports = function(context) {

    // Imports
    var usersModel = context.component('models').module('users');

    return {
        findOrCreate: function(document) {
            var deferred = context.promises.defer();

            usersModel.findOne(document, function(error, user) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                } else {
                    if(user == null){
                        usersModel.create(document, function(error, user) {
                            if (error) {
                                console.error(error);
                                deferred.reject(error);
                            } else {
                                deferred.resolve(user);
                            }
                        });
                    } else {
                        deferred.resolve(user);
                    }
                }
            });

            return deferred.promise;
        },

        findByGoogleId: function(googleId) {
            var deferred = context.promises.defer();

            usersModel.findOne({ googleId: googleId }, function(error, user) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                } else {
                    if(user == null){
                        deferred.reject("No user with that ID");
                    } else {
                        deferred.resolve(user);
                    }
                }
            });

            return deferred.promise;
        }
    };
};