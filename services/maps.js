module.exports = function(context) {
    const mapsController = context.component('controllers').module('maps');
    context.router
        .get('/maps/:iid/', mapsController.getImage)
        .post('/maps', mapsController.insertImage);
}