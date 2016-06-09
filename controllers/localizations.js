module.exports = function(context) {

    // Imports
    var localizationsDao = context.component('daos').module('localizations');

    return {
        getProteinsLocalizations: function(request, response) {
            const identifier = request.params.id.toUpperCase();
            
            if(identifier === undefined){
                response.send([]);
            } else {
                localizationsDao.findProteinNames(identifier).then(function(proteins){
                    response.send(proteins);
                }, function(error){
                    response.status(500).send(error);
                });
            }
        },
        
        getProteinByUniprotId: function(request, response) {
            const identifier = request.params.id.toUpperCase();
            
            if(identifier === undefined){
                response.status(403).send();
            } else {
                localizationsDao.findByUniprotId(identifier).then(function(protein){
                    response.send(protein);
                }, function(error){
                    response.status(500).send(error);
                });
            }
        },
    }
}