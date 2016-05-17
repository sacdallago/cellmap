module.exports = function(context) {
    const proteinsController = context.component('controllers').module('proteins');
    context.router
        .get('/proteins', proteinsController.getProteins);
}