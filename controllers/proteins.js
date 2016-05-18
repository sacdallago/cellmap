module.exports = function(context) {

    // Imports
    var localizationsDao = context.component('daos').module('localizations');

    return {
        getProteins: function(request, response) {
            const identifier = request.query.identifier.toUpperCase();

            if(identifier === undefined){
                response.send([]);
            } else {
                localizationsDao.findProteinNames(identifier).then(function(proteins){
                    response.send(proteins);
                }, function(error){
                    response.send(error);
                });
            }
        }
    }
}