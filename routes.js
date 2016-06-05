module.exports = function(context) {
    const imagesService = context.component('services').module('images');
    const frontendService = context.component('services').module('frontend');
    const featuresService = context.component('services').module('features');
    const localizationsService = context.component('services').module('localizations');
    const interactionsService = context.component('services').module('interactions');
    const mappingsService = context.component('services').module('mappings');
}