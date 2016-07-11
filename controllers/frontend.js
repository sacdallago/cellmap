module.exports = function(context) {

    // Imports
    var localizationsDao = context.component('daos').module('localizations');
    var proteinsDao = context.component('daos').module('proteins');

    return {
        index: function(request, response) {
            response.render('index', {
                title: 'Home'
            });
        },
        about: function(request, response) {
            response.render('about', {
                title: 'About'
            });
        },
        maps: function(request, response) {
            context.gridFs.files.find().toArray(function (err, files) {
                if (err) {
                    response.render('error', {
                        title: 'Error',
                        message: "Unable to retrieve maps metadata",
                        error: error
                    });
                }
                response.render('maps', {
                    title: 'Maps',
                    maps: files
                });
            })
        },
        map: function(request, response) {
            const imageId = request.params.iid;
            const proteins = request.query.p;

            localizationsDao.findProteins(proteins).then(function(requestProteins){
                response.render('map', {
                    title: 'Protein interaction visualizer',
                    iid: imageId,
                    requestProteins: requestProteins,
                    localizations: context.constants.localizations
                });
            },function(error){
                response.render('error', {
                    title: 'Error',
                    message: "Unable to retrieve images metadata",
                    error: error
                });
            });
        },
        error: function(request, response) {
            response.render('error', {
                title: 'Error',
                message: "There was an unknown error with your request.",
                error: "There was an unknown error with your request."
            });
        },
        ppi: function(request, response) {
            const imageId = request.params.iid;
            const proteins = request.query.p;

            localizationsDao.findProteins(proteins).then(function(requestProteins){
                response.render('ppi', {
                    title: 'Protein interaction visualizer',
                    iid: imageId,
                    requestProteins: requestProteins,
                    localizations: context.constants.localizations
                });
            }, function(error){
                response.render('error', {
                    title: 'Error',
                    message: "Unable to retrieve images metadata",
                    error: error
                });
            });
        },
        editor: function(request, response) {
            const imageId = request.params.iid;
            response.render('editor', {
                title: 'Protein interaction visualizer',
                iid: imageId,
                localizations: context.constants.localizations
            });
        },
        search: function(request, response) {
            response.render('search', {
                title: 'Search for proteins',
                localizations: context.constants.localizations
            });
        },

        protein: function(request, response) {
            const uniprotId = request.params.uniprotId;

            proteinsDao.findByUniprotId(uniprotId).then(function(requestProtein){
                response.render('protein', {
                    title: uniprotId,
                    localizations: context.constants.localizations,
                    protein: requestProtein
                });
            }, function(error){
                response.render('error', {
                    title: 'Error',
                    message: "Unable to retrieve protein data",
                    error: error
                });
            });

        }
    }
}