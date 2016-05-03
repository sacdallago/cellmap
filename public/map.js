jQuery(function() {

    var map = L.map('map', {
        maxZoom: 0,
        minZoom: 0,
        crs: L.CRS.Simple
    }).setView([0, 0], 0);

    var southWest = map.unproject([0, 592], map.getMaxZoom());
    var northEast = map.unproject([596, 0], map.getMaxZoom());
    map.setMaxBounds(new L.LatLngBounds(southWest, northEast));

    L.tileLayer('/public/y{y}x{x}.png', {
        attribution: 'Map data &copy; ???',
        errorTileUrl: '/public/blank.png',
        noWrap: true
    }).addTo(map);
});