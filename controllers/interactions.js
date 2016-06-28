module.exports = function(context) {

    // Imports
    var interactionsDao = context.component('daos').module('interactions');

    return {
        getProteinInteractions: function(request, response) {
            const identifier = request.params.id.toUpperCase();

            interactionsDao.findByUniprotEntryName(identifier).then(function(interactions){

                var result = [];

                interactions.forEach(function(interaction){
                    var interactor = interaction.edges.find(function(uniprotEntryName){
                        return uniprotEntryName !== identifier;
                    });

                    result.push({
                        interactor: interactor,
                        score: interaction.score
                    });
                });

                response.send(result);
            }, function(error){
                response.status(500).send(error);
            });

        }
    }
}