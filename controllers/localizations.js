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
                    response.send(error);
                });
            }
        }
    }
}