module.exports = function(context) {

    // Imports
    var localizationsDao = context.component('daos').module('localizations');

    return {
        home: function(request, response) {
            response.render('index', {
                title: 'Home'
            });
        },
        about: function(request, response) {
            response.render('about', {
                title: 'About'
            });
        },
        images: function(request, response) {
            context.gridFs.files.find().toArray(function (err, files) {
                if (err) {
                    response.render('error', {
                        title: 'Error',
                        message: "Unable to retrieve images metadata",
                        error: error
                    });
                }
                response.render('images', {
                    title: 'images',
                    images: files
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
        editor: function(request, response) {
            const imageId = request.params.iid;
            response.render('editor', {
                title: 'Protein interaction visualizer',
                iid: imageId,
                localizations: context.constants.localizations
            });
        }
    }
}