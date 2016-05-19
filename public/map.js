var featuresGeoJSON;
var overlayProteins = {};
var map;
var controlLayers;
var clusterGroup;

var localizations = {}

var initializeLocalizations = function(localizationsArray, callback){
    var sequentialColor = function(numOfSteps, step) {
        // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
        // Adam Cole, 2011-Sept-14
        // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
        var r, g, b;
        var h = step / numOfSteps;
        var i = ~~(h * 6);
        var f = h * 6 - i;
        var q = 1 - f;
        switch(i % 6){
            case 0: r = 1; g = f; b = 0; break;
            case 1: r = q; g = 1; b = 0; break;
            case 2: r = 0; g = 1; b = f; break;
            case 3: r = 0; g = q; b = 1; break;
            case 4: r = f; g = 0; b = 1; break;
            case 5: r = 1; g = 0; b = q; break;
        }
        var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
        return (c);
    };

    var total = localizationsArray.length;

    for(var i = 0; i < total; i++){
        localizations[localizationsArray[i]] = {
            count: 0,
            color: sequentialColor(total, i+5)
        };
    }

    callback();
}

var renderMap = function(imageId, callback) {
    renderProgress();
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

                map = L.map('map', {
                    maxZoom: 4,
                    minZoom: 1,
                    maxBounds: [[-100, width+100], [height+100, -100]],
                    crs: L.CRS.Simple
                }).setView([height/2, width/2], 1);

                L.imageOverlay(this.src, imageBounds).addTo(map);

                // Draw polygons --> Necessary?
                //map.pm.addControls();

                var lat = document.getElementById('lat');
                var lng = document.getElementById('lng');

                // Marker Cluster Group
                clusterGroup = L.markerClusterGroup();
                map.addLayer(clusterGroup);

                // Add controls for the layers
                controlLayers = L.control.layers();
                controlLayers.addTo(map);
                controlLayers.addOverlay(clusterGroup, "Clustered Proteins");

                // Add fading button
                loadFadingButton(map);

                hideProgress();
                callback();
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

var addToMapAndTable = function(protein){
    var mapped = [];
    var unmapped = [];
    var points = [];

    protein.consensus_sl.forEach(function(location){
        var geoLoc = _.find(featuresGeoJSON, function(geoLoc){
            return geoLoc.properties.localization == location;
        });

        if(geoLoc === undefined){
            unmapped.push(location);
        } else {
            mapped.push(location);

            // http://mathworld.wolfram.com/LogarithmicSpiral.html
            var r = localizations[location].count++;
            var theta = ((r%9)/4) * Math.PI;
            var x = ((r*10)*Math.cos(theta)) + geoLoc.geometry.coordinates[0];
            var y = ((r*10)*Math.sin(theta)) + geoLoc.geometry.coordinates[1];

            var marker = L.circleMarker([y,x],{
                radius: 6,
                fillColor: localizations[location].color,
                color: localizations[location].color,
                opacity: 1,
                fillOpacity: 1
            });

            marker.bindPopup(protein.uniprotac + " " + location);

            points.push(marker);
        }
    });

    // HTML table telling which localizations are mapped for protein and which not
    var container = document.getElementById('proteinList');
    var tr = document.createElement("tr");

    var proteinTd = document.createElement("td");
    proteinTd.appendChild(document.createTextNode(protein.uniprotac));
    tr.appendChild(proteinTd);

    var mappedTd = document.createElement("td");
    mappedTd.appendChild(document.createTextNode(mapped));
    tr.appendChild(mappedTd);

    var unmappedTd = document.createElement("td");
    unmappedTd.appendChild(document.createTextNode(unmapped));
    tr.appendChild(unmappedTd);

    container.appendChild(tr);
    // END of HTML table

    overlayProteins[protein.uniprotac] = L.layerGroup(points);

    overlayProteins[protein.uniprotac].addTo(map);
    controlLayers.addOverlay(overlayProteins[protein.uniprotac], protein.uniprotac);

    clusterGroup.addLayer(L.featureGroup(points)
                          .bindPopup(protein.uniprotac)
                         );
}

var addProteins = function(someProteins){
    someProteins.forEach(function(protein){
        addToMapAndTable(protein);
    });
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
        addToMapAndTable(result);

        //Add protein to search query in URL
        var currentUri = URI(window.location.href);
        currentUri.addSearch({'proteins':result.uniprotac});

        window.history.pushState({'proteins':result.uniprotac}, "CellMap", currentUri.resource());

        return true;
    }
});