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
    }
};