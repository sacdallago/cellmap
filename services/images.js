module.exports = function(context) {
    const imagesController = context.component('controllers').module('images');
    context.router
        .get('/images/:iid/', imagesController.getImage)
        .get('/images', imagesController.getImages)
        .get('/tiles/:md5/:z/:x/:y', imagesController.getTile)
        .post('/images', imagesController.insertImage);
}