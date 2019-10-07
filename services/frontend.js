module.exports = function(context) {
    const frontendController = context.component('controllers').module('frontend');
    context.router
        .get('/', frontendController.search)
        .get('/maps', frontendController.maps)
        .get('/map', frontendController.map)
        .get('/map/:iid', frontendController.map)
        .get('/editor/:iid', frontendController.editor)
        .get('/ppi', frontendController.ppi)
        .get('/ppi/:iid', frontendController.ppi)
        .get('/error', frontendController.error)
        .get('/search', frontendController.search)
        .get('/protein/:uniprotId', frontendController.protein)
        .get('/about', frontendController.about)
        .get('/legend', frontendController.legend);
}