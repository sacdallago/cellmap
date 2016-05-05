module.exports = function(context) {
    const imagesController = context.component('controllers').module('images');
    context.router
        .get('/images/:iid/', imagesController.getImage)
        .post('/images', imagesController.insertImage);
}