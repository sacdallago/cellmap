
module.exports = function(context) {
    return {
        home: function(request, response) {
            response.render('index', {
                title: 'Hey',
                message: 'Hello there!'
            });
        }
    }
}