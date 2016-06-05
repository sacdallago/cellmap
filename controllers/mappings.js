module.exports = function(context) {

    // Imports
    var mappingsDao = context.component('daos').module('mappings');

    return {
        getProteinsMappings: function(request, response) {
            const identifier = request.params.id.toUpperCase();

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
        getProteinMappingByUniProtID: function(request, response) {
            const identifier = request.params.id.toUpperCase();

            mappingsDao.findByUniprotId(identifier).then(function(mapping){
                if(mapping){
                    response.send(mapping);
                } else {
                    response.status(404).send();
                }
            }, function(error){
                response.status(500).send(error);
            });

        }
    }
}