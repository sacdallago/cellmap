var featuresLayer;
var drawnItems;

var renderMap = function(imageId) {
    var img = new Image();
    img.src = '/images/'+imageId;

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
            maxBounds: [[-100, width+100], [height+100, -100]],
            crs: L.CRS.Simple
        }).setView([height/2, width/2], 1);

        L.imageOverlay(this.src, imageBounds).addTo(map);

        // Add draw controls
        // Initialise the FeatureGroup to store drawn layers
        drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        // Initialise the draw control and pass it the FeatureGroup of editable layers
        var drawControl = new L.Control.Draw({
            draw: {
                marker: false,
                circle: {
                    metric: false,
                    showRadius: false,
                    shapeOptions: {
                        stroke: false,
                        opacity: 1,
                        color: '#AD0014',
                        fillOpacity: .8,
                    }
                },
                polyline: {
                    showLength: false,
                    shapeOptions: {
                        opacity: 1,
                        color: '#5235DF'
                    }
                },
                rectangle: {
                    shapeOptions: {
                        stroke: false,
                        opacity: 1,
                        color: '#FFD322',
                        fillOpacity: .8,
                    }
                },
                polygon: {
                    shapeOptions: {
                        stroke: true,
                        opacity: .8,
                        color: '#469531',
                        fillOpacity: .8,
                    }
                }
            }
        });

        map.on('draw:created', function (e) {
            var type = e.layerType;
            var layer = e.layer;

            // Allow always only one layer/feature on the drawnItems feature group.
            drawnItems.clearLayers();
            drawnItems.addLayer(layer);
        });

        map.addControl(drawControl);
        // END add draw controls

        featuresLayer = L.geoJson(undefined, {
            onEachFeature: function(feature, layer) {
                if (feature.properties && feature.properties.localization) {
                    // Very much code for just defining the div in the popup + the delete button
                    var content = document.createElement("div");
                    content.className = "ui attached segment";
                    var text = document.createTextNode(feature.properties.localization);
                    content.appendChild(text);

                    var btn = document.createElement("div");
                    // Interesting part: What to do when Delete button is clicked
                    btn.addEventListener('click', function(event){
                        var target = $(event.target)[0];
                        $.ajax({
                            url: '/features/' + target.dataset.id,
                            type: 'DELETE',
                            success: function(results) {
                                var object = _.find(featuresLayer._layers,function(object){
                                    return object.feature._id == target.dataset.id;
                                });

                                featuresLayer.removeLayer(object);
                            }
                        });
                    }, false);
                    btn.className = "ui attached delete button red";
                    btn.setAttribute('data-id', feature._id);
                    var btnText = document.createTextNode("Delete");
                    btn.appendChild(btnText);

                    var container = document.createElement("div");
                    container.appendChild(content);
                    container.appendChild(btn);

                    // Bind the text and the button to the popup
                    layer.bindPopup(container);
                }
            },
            pointToLayer: function (feature, latlng) {
                // TODO: find out if it is possible to have proportional radius to zoom!
                return L.circleMarker(latlng, {
                    radius: feature.properties.radius || 6
                });
            },
            style: function(feature) {
                if(feature.geometry.type == "LineString") {
                    return {
                        fillColor: localizations[feature.properties.localization].color,
                        color: localizations[feature.properties.localization].color,
                        weight: 4,
                        opacity: .8,
                        fillOpacity: .8
                    };
                } else {
                    return {
                        fillColor: localizations[feature.properties.localization].color,
                        color: localizations[feature.properties.localization].color,
                        weight: 0,
                        opacity: .8,
                        fillOpacity: .8
                    };
                }
            }
        }).addTo(map);


        // Get all the localizations that are already stored on the db.
        $.ajax({
            url: '/features/' + imageId,
            type: 'GET',
            success: function(results) {
                featuresLayer.addData(results);
            }
        });

        // Disable drag and zoom handlers.
        // map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        //map.keyboard.disable();

        // Disable tap handler, if present.
        if (map.tap) map.tap.disable();

        // Add fading button
        loadFadingButton(map);
    }
};

$('.dropdown').dropdown();

var writeMapId = function(imageId){
    document.getElementById('mapId').value = imageId;
}

$.fn.form.settings.rules.featureDefined = function() {
    return drawnItems.getLayers()[0] !== undefined;
};

$('.ui.form')
    .form({
    fields: {
        loc: {
            identifier: 'loc',
            rules: [
                {
                    type   : 'empty',
                    prompt : 'Please select a localization'
                }
            ]
        },
        mapId: {
            identifier: 'mapId',
            rules: [
                {
                    type   : 'empty',
                    prompt : 'There was an error. Please reload the page.'
                }
            ]
        },
        feature: {
            identifier: 'placeholder',
            rules: [
                {
                    type   : 'featureDefined',
                    prompt : 'Please first draw a shape'
                }
            ]
        }
    },
    onSuccess: function(event, fields){
        event.preventDefault();
        var feature = drawnItems.getLayers()[0];

        if(feature !== undefined){
            var geoJSON = feature.toGeoJSON();

            geoJSON.properties = {
                localization: fields.loc,
                map: fields.mapId
            };
            
            if(feature._radius){
                geoJSON.properties.radius = feature._radius;
            }

            $.ajax({
                url: '/features',
                type: 'POST',
                data: JSON.stringify(geoJSON),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(result) {
                    var object = _.find(featuresLayer._layers,function(object){
                        return object.feature._id == result._id;
                    });

                    if(object){
                        featuresLayer.removeLayer(object);
                    }
                    featuresLayer.addData(result)
                }
            });
        }
    }
});