module.exports = function(context) {

    // Imports
    var interactionsDao = context.component('daos').module('interactions');

    return {
        getProteinInteractions: function(request, response) {
            const identifier = request.params.id.toUpperCase();

            interactionsDao.findByUniprotId(identifier).then(function(interactions){

                var result = [];

                interactions.forEach(function(interaction){
                    var interactor = interaction.edges.find(function(uniprotId){
                        return uniprotId !== identifier;
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

        },
        getProteinsInteractions: function(request, response) {
            if(request.is('application/json')) {
                const formidable = context.formidable;
                const form = new formidable.IncomingForm();
                // Need to implement the storage of file xyz and then render home

                form.parse(request, function(error, fields, files) {
                    // TODO: parse fields, implement DAO, do the rest...
                    
                    interactionsDao.findByUniprotId(fields).then(function(interactions){
                        var result = [];

                        interactions.forEach(function(interaction){
                            var interactor = interaction.edges.find(function(uniprotId){
                                return uniprotId !== identifier;
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
                });
            } else {
                response
                    .status(400)
                    .render('error', {
                    title: 'Error',
                    message: "Unable to post request",
                    error: "Allowed calls include:\n - application/json\n"
                });
            }
        }
    }
}