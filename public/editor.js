var featuresLayer;

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
            crs: L.CRS.Simple
        }).setView([height/2, width/2], 1);

        L.imageOverlay(this.src, imageBounds).addTo(map);

        // Draw polygons --> Necessary?
        //map.pm.addControls();

        var lat = document.getElementById('lat');
        var lng = document.getElementById('lng');

        var marker = L.marker();

        function onMapClick(e) {
            lat.value = e.latlng.lat;
            lng.value = e.latlng.lng;

            marker
                .setLatLng(e.latlng)
                .addTo(map);
        }

        map.on('click', onMapClick);

        var geojsonMarkerOptions = {
            radius: 6,
            fillColor: "#048cff",
            color: "#f0ff42",
            weight: 4,
            opacity: 1,
            fillOpacity: 1
        };

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
                                location.reload();
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
                return L.circleMarker(latlng, geojsonMarkerOptions);
            }
        }).addTo(map);


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
    }
};

$('.dropdown').dropdown();

var writeMapId = function(imageId){
    document.getElementById('mapId').value = imageId;
}

$('.ui.form')
    .form({
    fields: {
        lng   : {
            identifier: 'lng',
            rules: [
                {
                    type   : 'empty',
                    prompt : 'Please select a point on the map'
                }
            ]
        },
        lat   : {
            identifier: 'lat',
            rules: [
                {
                    type   : 'empty',
                    prompt : 'Please select a point on the map'
                }
            ]
        },
        loc   : {
            identifier: 'loc',
            rules: [
                {
                    type   : 'empty',
                    prompt : 'Please select a localization'
                }
            ]
        },
        mapId   : {
            identifier: 'mapId',
            rules: [
                {
                    type   : 'empty',
                    prompt : 'There was an error. Please reload the page.'
                }
            ]
        }
    },
    onSuccess: function(event, fields){
        event.preventDefault();
        $.ajax({
            url: '/features',
            type: 'POST',
            data: fields,
            success: function(result) {
                featuresLayer.addData(result);
                console.log(result);
            }
        });
    }
});