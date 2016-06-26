module.exports = function(context) {
    const interactionsController = context.component('controllers').module('interactions');
    context.api
        .get('/interactions/:id', interactionsController.getProteinInteractions);
}