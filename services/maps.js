module.exports = function(context) {
    const mapsController = context.component('controllers').module('maps');
    context.api
        .get('/maps', mapsController.getImage)
        .get('/maps/:iid/', mapsController.getImage)
        .post('/maps', mapsController.insertImage);
};