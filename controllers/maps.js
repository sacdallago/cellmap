
module.exports = function(context) {
    return {
        deleteImage: function(request, response){
            const imageId = request.params.iid;

            if(imageId === undefined || imageId === null){
                return response.status(400).render('error', {
                    title: 'Not a valid image identifier',
                    message: "Cannot retrieve the image",
                    error: error
                });
            }

            return context.gridFs.remove({ "_id" : imageId }, function(error, removedItem) {
                if (error) {
                    return response.status(500).render('error', {
                        title: 'Could not remove item',
                        message: "Could not remove item",
                        error: error
                    });
                }

                return response.status(200).send(removedItem);
            });
        },
        getImage: function(request, response) {
            const imageId = request.params.iid;

            if(imageId !== undefined){
                var readstream = context.gridFs.createReadStream({
                    _id: imageId
                });

                readstream.on('error', function (error) {
                    response.status(404).render('404', {
                        title: '404',
                        message: "Unable to find image",
                        error: error
                    });

                });

                return readstream.pipe(response);
            } else if(request.user && request.user.map){
                return response.redirect('/api/maps/' + request.user.map);
            } else {
                return context.gridFs.findOne({},function(error, element){
                    if(error){
                        response.status(500).render('error', {
                            title: '500',
                            message: "Cannot retrieve an image",
                            error: error
                        });
                    } else if(element === null){
                        response.status(404).render('404', {
                            title: '404',
                            message: "Cannot retrieve an image",
                            error: error
                        });
                    } else {
                        return response.redirect('/api/maps/' + element._id);
                    }
                });
            }
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
                        response.status(500).render('error', {
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
                        response.status(500).render('error', {
                            title: 'Error',
                            message: "Not able to write file",
                            error: error
                        });
                    });
                    destination.on('close', function () {
                        response.status(200).send();
                    });
                });
            } else {
                response.status(403).render('error', {
                    title: 'Error',
                    message: "Unable to post request",
                    error: "Allowed calls include:\n - multipart/form-data\n With attributes 'image' in jpeg or png format"
                });
            }
        }
    }
};