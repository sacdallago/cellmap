
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
        getTile: function(request, response) {

            const md5 = request.params.md5;
            const z = request.params.z;
            const x = request.params.x;
            const y = request.params.y;

            var readstream = context.gridFs.createReadStream({
                md5: md5,
                z: z,
                x: x,
                y: y

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
        getImages: function(request, response) {
            response.status(200).send();
        },
        insertImage: function(request, response) {
            if(request.is('multipart/form-data')) {
                const formidable = context.formidable;
                const form = new formidable.IncomingForm();
                // Need to implement the storage of file xyz and then render home

                form.parse(request, function(error, fields, files) {
                    if(error){
                        response.render('error', {
                            title: 'Error',
                            message: "Unable to post request",
                            error: error
                        });
                    }

                    const image = files.image;

                    if (image.type != 'image/png' && image.type != 'image/jpeg') {
                        response.render('error', {
                            title: 'Error',
                            message: "Unable to post request",
                            error: "Allowed calls include:\n"+
                            "- multipart/form-data\n"+
                            "With attributes 'image' in jpeg or png format"
                        });
                        return;
                    }

                    var source = context.fs.createReadStream(image.path);
                    var destination = context.gridFs.createWriteStream();
                    source.pipe(destination);

                    destination.on('error', function (error) {
                        response.render('error', {
                            title: 'Error',
                            message: "Unable to post request",
                            error: error
                        });
                    });
                    destination.on('close', function (file) {            
                        // gm convert -crop 256x256 input.png +adjoin tile%04d.png
                        // gm convert tile0019.png -background transparent -extent 256x256 samename.png

                        /*
                            The following only writes ONE file!
                            context.gm()
                                .command('convert')
                            .in('+adjoin')
                                .crop(256,256)

                                .in(image.path)
                                .write('test'+ '%04d.png', function (err) {
                                if (err) console.log(err);
                            });
                            */

                        const tile = context.childProcess.spawn('gm', ['convert','-crop','256x256', image.path, "+adjoin", __dirname + "/../tiles/" + file._id + "%04d.png"]);

                        tile.on('close', (code) => {
                            if(code === 0){
                                const extent = context.childProcess.spawn('gm', ['mogrify','-extent','256x256', "-background", "transparent", __dirname + "/../tiles/" + file._id + "*.png"]);
                                response.send(200);
                            } else {
                                console.error('Failed to tile image. Code ' + code);
                            }
                        });
                    });
                });
            } else {
                response.render('error', {
                    title: 'Error',
                    message: "Unable to post request",
                    error: "Allowed calls include:\n"+
                    "- multipart/form-data\n"+
                    "With attributes 'image' in jpeg or png format"
                });
            }
        }
    }
}