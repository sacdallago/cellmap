module.exports = function(context) {
    const frontendController = context.component('controllers').module('frontend');
    context.router
        .get('/', frontendController.home)
        .get('/images', frontendController.images)
        .get('/map/:iid', frontendController.map)
        .get('/editor/:iid', frontendController.editor)
        .get('/ppi/:iid', frontendController.ppi)
        .get('/about', frontendController.about);
}