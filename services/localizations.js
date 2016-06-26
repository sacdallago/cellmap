module.exports = function(context) {
    const localizationsController = context.component('controllers').module('localizations');
    context.api
        .get('/localizations/uniprotId/:id', localizationsController.getProteinByUniprotId)
        .get('/localizations/search/:id', localizationsController.getProteinsLocalizations);
}