module.exports = function(context) {
    const localizationsController = context.component('controllers').module('localizations');
    context.router
        .get('/localizations/uniprotId/:id', localizationsController.getProteinByUniprotId)
        .get('/localizations/search/:id', localizationsController.getProteinsLocalizations);
}