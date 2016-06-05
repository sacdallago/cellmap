module.exports = function(context) {

    // Imports
    var mappingsDao = context.component('daos').module('mappings');
    var localizationsDao = context.component('daos').module('localizations');

    return {
        getProteinsMappings: function(request, response) {
            const identifier = request.query.identifier.toUpperCase();

            if(identifier === undefined){
                response.send([]);
            } else {
                mappingsDao.findProteinNames(identifier).then(function(proteins){
                    response.send(proteins);
                }, function(error){
                    response.send(error);
                });
            }
        },
        
        getProteinsLocalizations: function(request, response) {
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