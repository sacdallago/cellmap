jQuery(function() {

    var map = L.map('map', {
        maxZoom: 10,
        minZoom: 10,
        crs: L.CRS.Simple
    }).setView([0, 0], 10);

    var southWest = map.unproject([0, 592], map.getMaxZoom());
    var northEast = map.unproject([596, 0], map.getMaxZoom());
    map.setMaxBounds(new L.LatLngBounds(southWest, northEast));

    L.imageOverlay ('/public/cell.png', {
        imageBounds: 
        [[0, 250], [250, 0]]
    }).addTo(map);
});