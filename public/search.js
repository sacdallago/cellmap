$.fn.api.settings.api = {
    'get from localizations': '/api/localizations/search/{query}',
    'get from mappings': '/api/mappings/search/{query}',
    'get from proteins': '/api/proteins/search/{query}',
};


const grid = $('.grid').isotope({
    // main isotope options
    itemSelector: '.grid-item',
    // set layoutMode
    layoutMode: 'packery',
    packery: {
        gutter: 10
    },
    // options for cellsByRow layout mode
    cellsByRow: {
        columnWidth: 200,
        rowHeight: 150
    }
});

const modal = function(protein){
    var html = '<div class="ui modal">';
    // '<i class="close icon"></i>';
    html += '<div class="header">' + protein.uniprotId + '</div>';
    html += '<div class="content">';
    html += '<p><strong>Primary gene:</strong> ' + protein.geneName + '</p>';
    if(protein.proteinName){
        html += '<p><strong>Protein name:</strong> ' + protein.proteinName + '</p>';
    }
    if(protein.localizations && protein.localizations.localizations && protein.localizations.localizations.length > 0){
        html += '<p><strong>Localizations:</strong> ' + protein.localizations.localizations.map(function(element){return element + " "}) + '</p>';
    }
    if(protein.interactions && protein.interactions.partners && protein.interactions.partners.length > 0){
        html += '<p><strong>Interaction partners:</strong> ' + protein.interactions.partners.map(function(element){return element.interactor + " "}) + '</p>';
    }
    html += '</div>';
    html += '<div class="actions"><a href="/protein/' + protein.uniprotId + '" class="ui approve button">Go to protein page</a></div>';
    html += '</div>';
    $(html).modal('show');
}

grid.on( 'click', '.grid-item', function() {
    modal($(this).data('protein'));
});

$('.ui.search').search({
    apiSettings: {
        action: 'get from proteins',

    },
    minCharacters : 2,
    onResultsAdd: function(response) {
        // Don't add HTML
        return false;
    },
    onResults: function(response) {

        grid.empty();

        var items = [];

        response.forEach(function(protein){
            var html = '<div class="grid-item">' + protein.uniprotId + '<div class="cubescontainer">';

            if(protein.localizations && protein.localizations.localizations && protein.localizations.localizations.length > 0){
                console.log('fere');
                protein.localizations.localizations.forEach(function(localization){
                    html += '<div class="cube" style="background-color:' + localizations[localization].color + ';"></div>'
                });
            }

            html += '</div></div>';

            var element = $(html);

            element.data("protein", protein);

            items.push(element[0]);
        });

        //grid.append(items).isotope('appended', items).isotope('shuffle');

        grid.isotope('insert', items);

        return false;
    },
});
