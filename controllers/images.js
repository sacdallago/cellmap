
module.exports = function(context) {
    return {
        getImage: function(request, response) {
            const imageId = request.params.iid;

            var readstream = context.gridFs.createReadStream({
                _id: imageId
            });

            readstream.on('error', function (error) {

                response.render('404', {
                    title: '404',
                    message: "Unable to find image",
                    error: error
                });

            });

            readstream.pipe(response);
        },
        insertImage: function(request, response) {
            if(request.is('multipart/form-data')) {
                const formidable = context.formidable;
                const form = new formidable.IncomingForm();
                // Need to implement the storage of file xyz and then render home

                form.parse(request, function(error, fields, files) {
                    const image = files.image;

                    if(error || image === undefined){
                        response.render('error', {
                            title: 'Error',
                            message: "Unable to post request",
                            error: error || "No image was passed"
                        });
                        return;
                    }

                    if (image.type != 'image/png' && image.type != 'image/jpeg') {
                        response.render('error', {
                            title: 'Error',
                            message: "Unable to post request",
                            error: "Allowed calls include:\n - multipart/form-data\n With attributes 'image' in jpeg or png format"
                        });
                        return;
                    }

                    var source = context.fs.createReadStream(image.path);
                    var destination = context.gridFs.createWriteStream();
                    source.pipe(destination);

                    destination.on('error', function (error) {
                        response.render('error', {
                            title: 'Error',
                            message: "Not able to write file",
                            error: error
                        });
                    });
                    destination.on('close', function (file) {            
                        response.redirect('images');
                    });
                });
            } else {
                response.render('error', {
                    title: 'Error',
                    message: "Unable to post request",
                    error: "Allowed calls include:\n - multipart/form-data\n With attributes 'image' in jpeg or png format"
                });
            }
        }
    }
}