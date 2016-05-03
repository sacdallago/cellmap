
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
        getImages: function(request, response) {
            response.status(200).send();
        },
        insertImage: function(request, response) {
            if(request.is('multipart/form-data')) {
                const formidable = context.formidable;
                const form = new formidable.IncomingForm();
                // Need to implement the storage of file xyz and then render home

            } else {
                response.render('error', {
                    title: 'Error',
                    message: "Unable to post request",
                    error: "Allowed calls include:\n"+
                    "- multipart/form-data\n"+
                    "With attributes 'email', 'fasta' and optional 'pssh'\n"+
                    "If sending fasta + pssh files, only one sequence can be present in the fasta file."
                });
            }
        }
    }
}