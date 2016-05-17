module.exports = function(context) {
    const featuresController = context.component('controllers').module('features');
    context.router
        .get('/features/:iid/', featuresController.getFeatures)
        .delete('/features/:fid', featuresController.removeFeature)
        .post('/features', featuresController.updateFeature);
}