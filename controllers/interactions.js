module.exports = function(context) {

    // Imports
    var interactionsDao = context.component('daos').module('interactions');

    return {
        getProteinInteractions: function(request, response) {
            const identifier = request.query.p.toUpperCase();

            interactionsDao.findByUniprotId(identifier).then(function(interactions){
                
                console.log(interactions);
                
                var result = [];
                
                interactions.forEach(function(interaction){
                    var interactor = interaction.edges.find(function(uniprotId){
                        return uniprotId !== identifier;
                    });
                    
                    result.append({
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