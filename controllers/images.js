
module.exports = function(context) {
    return {
        getImage: function(request, response) {

            var readstream = context.gridFs.createReadStream({
                filename: "requestID"
            });

            readstream.on('error', function (error) {

                response.status(404).send({
                    message: 'Unable to locate file',
                    code: 404
                });

            });

            readstream.pipe(response);
        },
        getImages: function(request, response) {
            response.status(200).send();
        },
        inserImage: function(request, response) {
            response.status(200).send();
        }
    }
}