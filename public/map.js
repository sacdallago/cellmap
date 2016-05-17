var featuresGeoJSON;
var proteinsLayer;

var renderMap = function(imageId) {
    // Wait till I have the localizations of the features
    $.ajax({
        url: '/features/' + imageId,
        type: 'GET',
        success: function(results) {
            featuresGeoJSON = results;

            var img = new Image();
            img.src = '/images/'+imageId;

            // Wait untill I have the image
            img.onload = function() {
                var width = this.width;
                var height = this.height;

                while(width > 500 || height > 500){
                    width /= 2;
                    height /= 2;
                }

                var imageBounds = [[0, width], [height, 0]];

                var map = L.map('map', {
                    maxZoom: 4,
                    minZoom: 1,
                    crs: L.CRS.Simple
                }).setView([height/2, width/2], 1);

                L.imageOverlay(this.src, imageBounds).addTo(map);

                // Draw polygons --> Necessary?
                //map.pm.addControls();

                var lat = document.getElementById('lat');
                var lng = document.getElementById('lng');

                var geojsonMarkerOptions = {
                    radius: 6,
                    fillColor: "#048cff",
                    color: "#f0ff42",
                    weight: 4,
                    opacity: 1,
                    fillOpacity: 1
                };

                //        featuresLayer = L.geoJson(undefined, {
                //            onEachFeature: function(feature, layer) {
                //                if (feature.properties && feature.properties.localization) {
                //                    // Very much code for just defining the div in the popup + the delete button
                //                    var content = document.createElement("div");
                //                    content.className = "ui attached segment";
                //                    var text = document.createTextNode(feature.properties.localization);
                //                    content.appendChild(text);
                //
                //                    var container = document.createElement("div");
                //                    container.appendChild(content);
                //
                //                    // Bind the text and the button to the popup
                //                    layer.bindPopup(container);
                //                }
                //            },
                //            pointToLayer: function (feature, latlng) {
                //                return L.circleMarker(latlng, geojsonMarkerOptions);
                //            }
                //        }).addTo(map);

                proteinsLayer = new L.layerGroup().addTo(map);
            }
        }
    });
};

$.fn.api.settings.api = {
    'get proteins': '/proteins?identifier={query}',
};

$.fn.search.settings.templates.protein = function(response) {
    var html = '';
    $.each(response.results, function(index, result) {
        html += '' + '<div class="result">' +
            '<span class="name">' + result.uniprotac + '</span>, ' +
            '<small> Approved symbol ' + result.approvedsymbol + '</small>' +
            '</div>';
    });
    return html;
}

$('.ui.search').search({
    type: 'protein',
    apiSettings: {
        action: 'get proteins',
        onResponse: function(response) {
            return {
                results: response
            };
        }
    },
    minCharacters : 2,
    onSelect: function(result, response) {
        console.log(result);

        return true;
    }
});