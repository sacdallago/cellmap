var loadFadingButton = function(map){
    L.easyButton({
        states: [{
            stateName: 'fade',   // name the state
            icon:      'moon icon',          // and define its properties
            title:     'fade', // like its title
            onClick: function(btn, map) {  // and its callback
                $(".leaflet-image-layer").css("opacity",.1);
                btn.state('unfade'); // change state on click!
            }
        }, {
            stateName: 'unfade',   // name the state
            icon:      'sun icon',          // and define its properties
            title:     'unfade', // like its title
            onClick: function(btn, map) {  // and its callback
                $(".leaflet-image-layer").css("opacity",1);
                btn.state('fade'); // change state on click!
            }
        }]
    }).addTo(map);
}