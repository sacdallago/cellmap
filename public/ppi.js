var featuresGeoJSON;
var overlayProteins = {};
var map;
var controlLayers;
var underlayingFeatureLayer;

var PPINButton = function(map){
    L.easyButton({
        states: [{
            stateName: 'loadPPIN',   // name the state
            icon:      'asterisk icon',          // and define its properties
            title:     'Network', // like its title
            onClick: function(btn, map) {  // and its callback
                renderProgress();
                var mappables = [];
                for(var key in overlayProteins){
                    // If it makes sense to load protein 
                    if(overlayProteins[key].layer !== undefined){
                        mappables.push(key);
                    }
                }

                $.ajax({
                    url: '/interactions',
                    type: 'POST',
                    data: JSON.stringify(mappables),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function(results) {
                        hideProgress();
                    }
                });
            }
        }]
    }).addTo(map);
};

var randomPointInPoly = function(polygon, vs) {
    var bounds = polygon.getBounds(); 
    var x_min  = bounds.getEast();
    var x_max  = bounds.getWest();
    var y_min  = bounds.getSouth();
    var y_max  = bounds.getNorth();

    var x = y_min + (Math.random() * (y_max - y_min));
    var y = x_min + (Math.random() * (x_max - x_min));

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    if (inside) {
        return [y, x];
    } else {
        return randomPointInPoly(polygon, vs);
    }
};

var renderMap = function(imageId, callback) {
    renderProgress();
    // Wait till I have the localizations
    $.ajax({
        url: '/features/' + imageId,
        type: 'GET',
        success: function(results) {
            featuresGeoJSON = results;

            var img = new Image();
            img.src = '/maps/'+imageId;

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

                // Add controls for the layers
                controlLayers = L.control.layers();
                controlLayers.addTo(map);

                // Disable drag and zoom handlers.
                // map.dragging.disable();
                //map.touchZoom.disable();
                //map.doubleClickZoom.disable();
                map.scrollWheelZoom.disable();
                //map.keyboard.disable();

                // Disable tap handler, if present.
                if (map.tap) map.tap.disable();

                // Add fading button
                PPINButton(map);
                loadFadingButton(map);

                // Add features highlight

                var featuresLayer = L.geoJson(featuresGeoJSON, {
                    pointToLayer: function (feature, latlng) {
                        return L.circle(latlng, {
                            radius: feature.properties.radius || 6,
                            interactive: false
                        });
                    },
                    style: function(feature) {
                        if(feature.geometry.type == "LineString") {
                            return {
                                fillColor: localizations[feature.properties.localization].color,
                                color: localizations[feature.properties.localization].color,
                                weight: 4,
                                opacity: .8,
                                fillOpacity: .8,
                                interactive: false
                            };
                        } else {
                            return {
                                fillColor: localizations[feature.properties.localization].color,
                                color: localizations[feature.properties.localization].color,
                                weight: 0,
                                opacity: .8,
                                fillOpacity: .8,
                                interactive: false
                            };
                        }
                    }
                });

                controlLayers.addOverlay(featuresLayer, "Localizations");

                underlayingFeatureLayer = L.geoJson(featuresGeoJSON, {
                    pointToLayer: function (feature, latlng) {
                        return L.circle(latlng, {
                            radius: feature.properties.radius || 6,
                            interactive: false
                        });
                    },
                    style: function(feature) {
                        if(feature.geometry.type == "LineString") {
                            return {
                                fillColor: "#a7adba",
                                color: "#a7adba",
                                weight: 4,
                                opacity: 0,
                                fillOpacity: 0,
                                interactive: false
                            };
                        } else {
                            return {
                                fillColor: "#a7adba",
                                color: "#a7adba",
                                weight: 0,
                                opacity: 0,
                                fillOpacity: 0,
                                interactive: false
                            };
                        }
                    }
                });

                underlayingFeatureLayer.addTo(map);

                hideProgress();
                callback();
            }
        }
    });
};

var addToMapAndTable = function(protein){

    // If the protein is already there, don't add it again!
    if(overlayProteins[protein.uniprotId] !== undefined){
        return;
    }

    var mapped = [];
    var unmapped = [];

    // Array for the different locations
    var points = [];

    protein.localizations.forEach(function(element){
        var geoLoc = _.find(featuresGeoJSON, function(geoLoc){
            return geoLoc.properties.localization == element;
        });

        if(geoLoc === undefined){
            unmapped.push(element);
        } else {
            mapped.push({
                geoLoc: geoLoc,
                loc: element
            });
        }
    });

    // Create selection for localizations
    var menu;

    if(mapped.length > 1){
        menu = '<div class="ui dropdown locselecter">';
        menu += '<div class="text">New localization</div>';
        menu += '<i class="dropdown icon"></i>';
        menu += '<div class="menu">';

        mapped.forEach(function(locationObject){
            menu += '<div class="item" data-value="' + protein.uniprotId + '">' + locationObject.loc + '</div>';
        });

        menu += '</div></div>';
    }

    for(var i=0; i < mapped.length; i++){

        var location = mapped[i].loc;
        var geoLoc = mapped[i].geoLoc;

        try {

            var x = 0;
            var y = 0;

            switch(geoLoc.geometry.type){
                case "Polygon":
                    var coords = randomPointInPoly(L.polygon(geoLoc.geometry.coordinates), geoLoc.geometry.coordinates[0]);
                    x = coords[1];
                    y = coords[0];
                    break;
                case "Point":
                    // http://stackoverflow.com/questions/481144/equation-for-testing-if-a-point-is-inside-a-circle
                    var center = geoLoc.geometry.coordinates;
                    var radius = geoLoc.properties.radius;
                    var x_max = center[0]+radius;
                    var x_min = center[0]-radius;

                    var y_max = center[1]+radius;
                    var y_min = center[1]-radius;

                    x = x_min + (Math.random() * (x_max - x_min));
                    y = y_min + (Math.random() * (y_max - y_min));

                    x = x_max;
                    y = y_max;

                    while(Math.pow(x - center[0],2) + Math.pow(y - center[1], 2) > Math.pow(radius, 2)){
                        x = x_min + (Math.random() * (x_max - x_min));
                        y = y_min + (Math.random() * (y_max - y_min));
                    }
                    break;
                case "LineString":
                    var position = Math.floor(Math.random() * geoLoc.geometry.coordinates.length);
                    var a = geoLoc.geometry.coordinates[position];
                    var b = geoLoc.geometry.coordinates[position+1];
                    var reg = regression('linear',[a,b]);

                    var x_max = a[0];
                    var x_min = b[0];

                    if(x_max < b[0]) {
                        x_max = b[0];
                        x_min = a[0];
                    }

                    x = x_min + (Math.random() * (x_max - x_min));

                    y = reg.equation[0]*x + reg.equation[1];

                    break;
            }


            var marker = L.circleMarker([y,x],{
                radius: 6,
                fillColor: localizations[location].color,
                color: localizations[location].color,
                // Only show first localization, but draw them all
                opacity: 1, 
                fillOpacity: 1
            });

            // Assign a location to the marker, so to then highlight it if needed:
            marker.location = location;

            // Bind popup to marker and add overlay of feature when clicked.
            var popup;

            if(mapped.length > 1){
                popup = L.popup().setContent('<p><strong>' + protein.uniprotId + " - " + location + "</strong><br>" + menu + '</p>');
            } else {
                popup = L.popup().setContent('<p><strong>' + protein.uniprotId + " - " + location + "</strong></p>");
            }



            popup.locations = protein.localizations;
            marker.bindPopup(popup);

            marker.on('popupopen', function(e) {
                // Load dropdown selector
                // When new location selected, change opacity + interactive
                $('.ui.dropdown.locselecter').dropdown({
                    onChange: function(value, text, $selectedItem) {                
                        var newLocPoint = _.find(overlayProteins[value].points, function(point){
                            return point.location == text;
                        });
                        overlayProteins[value].layer.clearLayers();
                        overlayProteins[value].layer.addLayer(newLocPoint);
                    }
                });

                var locs = e.popup.locations;

                locs.forEach(function(loc){
                    var object = _.find(underlayingFeatureLayer._layers,function(object){
                        return object.feature.properties.localization == loc;
                    });

                    if(object){
                        object.setStyle({
                            opacity: .8,
                            fillOpacity: .8,
                        });
                    }
                });
            });

            marker.on('popupclose', function(e) {
                var locs = e.popup.locations;

                locs.forEach(function(loc){
                    var object = _.find(underlayingFeatureLayer._layers,function(object){
                        return object.feature.properties.localization == loc;
                    });

                    if(object){
                        object.setStyle({
                            opacity: 0,
                            fillOpacity: 0,
                        });
                    }
                });
            });

            points.push(marker);
        } catch (e) {
            // Need to make something smarter here: case point calculation exceeedes heap. Very likely with Polygons!
            console.log(e);
            console.log("Will reload");
            window.location.reload();
        }
    }

    // HTML table telling which localizations are mapped for protein and which not
    var container = document.getElementById('proteinLocalizationList');
    var tr = document.createElement("tr");

    var proteinTd = document.createElement("td");
    proteinTd.appendChild(document.createTextNode(protein.uniprotId));
    tr.appendChild(proteinTd);

    var mappedTd = document.createElement("td");
    mappedTd.appendChild(document.createTextNode(mapped.map(function(element){return element.loc})));
    tr.appendChild(mappedTd);

    var unmappedTd = document.createElement("td");
    unmappedTd.appendChild(document.createTextNode(unmapped));
    tr.appendChild(unmappedTd);

    container.appendChild(tr);
    // END of HTML table

    // HTML table mapping uniprot ID to other identifiers
    $.ajax({
        url: '/api/mappings/uniprot/' + protein.uniprotId,
        type: 'GET',
        success: function(result) {
            if(result){
                var container = document.getElementById('proteinMappingList');
                var tr = document.createElement("tr");

                var proteinTd = document.createElement("td");
                proteinTd.appendChild(document.createTextNode(result.uniprotId));
                tr.appendChild(proteinTd);

                var entryName = document.createElement("td");
                entryName.appendChild(document.createTextNode(result.entryName));
                tr.appendChild(entryName);

                var proteinName = document.createElement("td");
                proteinName.appendChild(document.createTextNode(result.proteinName));
                tr.appendChild(proteinName);

                var geneName = document.createElement("td");
                geneName.appendChild(document.createTextNode(result.geneName));
                tr.appendChild(geneName);

                container.appendChild(tr);
            } else {
                console.log("No mapping information for: ", protein.uniprotId);
            }
        }
    });
    // END of HTML table

    if(points[0] !== undefined){
        overlayProteins[protein.uniprotId] = {
            layer : L.layerGroup(),
            points: points
        };
        overlayProteins[protein.uniprotId].layer.addLayer(points[0]);
    } else {
        overlayProteins[protein.uniprotId] = {
            layer : undefined,
            points: undefined
        };
    }

    if(overlayProteins[protein.uniprotId].layer !== undefined) {
        overlayProteins[protein.uniprotId].layer.addTo(map);
        controlLayers.addOverlay(overlayProteins[protein.uniprotId].layer, protein.uniprotId);
    }
}

var addProteins = function(someProteins){
    someProteins.forEach(function(protein){
        addToMapAndTable(protein);
    });
}

$.fn.api.settings.api = {
    'get from localizations': '/api/localizations/search/{query}',
    'get from mappings': '/api/mappings/search/{query}',
};

$.fn.search.settings.templates.protein = function(response) {
    var html = '';
    $.each(response.results, function(index, result) {
        html += '' + '<div class="result">';
        html += '<span class="name">' + result.entryName + '</span>, ';
        html += '<small> [UniProt ID] ' + result.uniprotId + '</small>';
        html += ( (result.geneId && result.geneId.length > 0) ? ('<small> [Gene ID] ' + result.geneId + '</small>') : "" );
        html += '</div>';
    });
    return html;
}

$.fn.search.settings.templates.mapping = function(response) {
    var html = '';
    $.each(response.results, function(index, result) {
        html += '' + '<div class="result">';
        html += '<span class="name">' + result.uniprotId + '</span>, ';
        html += '<small> [Entry] ' + result.entryName + '</small>';
        // html += '<small> [Protein] ' + result.proteinName + '</small><br>';
        html += '<small> [Gene] ' + result.geneName + '</small>';
        html += '</div>';
    });
    return html;
}

$.fn.search.settings.templates.localization = function(response) {
    var html = '';
    $.each(response.results, function(index, result) {
        html += '' + '<div class="result">' +
            '<span class="name">' + result.uniprotId + '</span>, ' +
            '<small> [Gene] ' + result.geneName + '</small>' +
            '</div>';
    });
    return html;
}

$('.ui.search').search({
    type: 'mapping',
    apiSettings: {
        action: 'get from mappings',
        onResponse: function(response) {
            return {
                results: response
            };
        }
    },
    minCharacters : 2,
    onSelect: function(result, response) {
        $.ajax({
            url: '/api/localizations/uniprotId/' + result.uniprotId,
            type: 'GET',
            success: function(uniprotLocProtein) {
                addToMapAndTable(uniprotLocProtein);
            }
        });

        //Add protein to search query in URL
        var currentUri = URI(window.location.href);
        currentUri.addSearch({'p':result.uniprotId});

        window.history.pushState({'p':result.uniprotId}, "CellMap", currentUri.resource());

        return true;
    }
});

$('.ui.accordion')
    .accordion({
    selector: {
        trigger: '.title'
    }
});