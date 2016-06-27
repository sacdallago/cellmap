module.exports = function(context) {
    const frontendController = context.component('controllers').module('frontend');
    context.router
        .get('/', frontendController.index)
        .get('/maps', frontendController.maps)
        .get('/map/:iid', frontendController.map)
        .get('/editor/:iid', frontendController.editor)
        .get('/ppi/:iid', frontendController.ppi)
        .get('/error', frontendController.error)
        .get('/about', frontendController.about);
}