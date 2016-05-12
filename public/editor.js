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

        //      For the future: Save objects (nucleus, ribosome,...) as geoJson (http://geojson.org/geojson-spec.html) data 
        //        L.geoJson(data, {
        //            style: function (feature) {
        //                return {color: feature.properties.color};
        //            },
        //            onEachFeature: function (feature, layer) {
        //                layer.bindPopup(feature.properties.description);
        //            }
        //        }).addTo(map);
    }
};

$('.dropdown').dropdown();

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
    },
    onSuccess: function(event, fields){
        event.preventDefault();
        console.log('ok');
    }
});