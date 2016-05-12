
module.exports = function(context) {
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
            response.render('map', {
                title: 'Protein interaction visualizer',
                iid: imageId
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