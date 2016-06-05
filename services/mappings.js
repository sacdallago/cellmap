module.exports = function(context) {
    const mappingsController = context.component('controllers').module('mappings');
    context.router
        .get('/mappings/uniprot/:id', mappingsController.getProteinMappingByUniProtID)
        .get('/mappings/search/:id', mappingsController.getProteinsMappings);
}