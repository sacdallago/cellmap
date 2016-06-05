module.exports = function(context) {
    const localizationsController = context.component('controllers').module('localizations');
    context.router
        .get('/localizations/search/:id', localizationsController.getProteinsLocalizations);
}