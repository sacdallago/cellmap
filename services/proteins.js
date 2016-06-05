module.exports = function(context) {
    const proteinsController = context.component('controllers').module('proteins');
    context.router
        .get('/proteins/mappings', proteinsController.getProteinsMappings)
        .get('/proteins/localizations', proteinsController.getProteinsLocalizations);
}