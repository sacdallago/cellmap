
module.exports = function(context) {
    return {
        home: function(request, response) {
            response.render('index', {
                title: 'Home',
                scripts: [
                    '/public/map.js'
                ]
            });
        },
        about: function(request, response) {
            response.render('about', {
                title: 'About'
            });
        }
    }
}