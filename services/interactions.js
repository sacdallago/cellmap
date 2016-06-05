module.exports = function(context) {
    const interactionsController = context.component('controllers').module('interactions');
    context.router
        .get('/interactions/:id', interactionsController.getProteinInteractions);
}