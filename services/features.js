module.exports = function(context) {
    const featuresController = context.component('controllers').module('features');
    context.api
        .post('/features', featuresController.updateFeature);
    context.router
        .get('/features/:iid/', featuresController.getFeatures)
        .delete('/features/:fid', featuresController.removeFeature);
}