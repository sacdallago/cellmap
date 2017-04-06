var loadFadingButton = function(map){
    L.easyButton({
        states: [{
            stateName: 'fade',   // name the state
            icon:      'half empty star icon',          // and define its properties
            title:     'Fade', // like its title
            onClick: function(btn, map) {  // and its callback
                $(".leaflet-image-layer").css("opacity",.5);
                btn.state('halffade'); // change state on click!
            }
        }, {
            stateName: 'halffade',   // name the state
            icon:      'empty star icon',          // and define its properties
            title:     'Half Fade', // like its title
            onClick: function(btn, map) {  // and its callback
                $(".leaflet-image-layer").css("opacity",.1);
                btn.state('unfade'); // change state on click!
            }
        }, {
            stateName: 'unfade',   // name the state
            icon:      'star icon',          // and define its properties
            title:     'Unfade', // like its title
            onClick: function(btn, map) {  // and its callback
                $(".leaflet-image-layer").css("opacity",1);
                btn.state('fade'); // change state on click!
            }
        }]
    }).addTo(map);
};

var addHomeButton = function(map){
    L.easyButton({
        position: 'topleft',
        states: [{
            stateName: 'gohome',   // name the state
            icon:      'Home icon',          // and define its properties
            title:     'Go home', // like its title
            onClick: function(btn, map) {  // and its callback
                window.location.href = '/';
            }
        }]
    }).addTo(map);
};

var initializeLocalizations = function(localizationsArray){
    var localizations = {};

    // Extend string prototypes to allow color hashing
    String.prototype.getHashCode = function() {
        var hash = 0;
        if (this.length == 0) return hash;
        for (var i = 0; i < this.length; i++) {
            hash = this.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    Number.prototype.intToHSL = function() {
        var shortened = this % 360;
        return "hsl(" + shortened + ",100%,40%)";
    };

    var total = localizationsArray.length;

    for(var i = 0; i < total; i++){
        localizations[localizationsArray[i]] = {
            count: 0,
            color: localizationsArray[i].getHashCode().intToHSL()
        };
    }

    return localizations;
};

var localizationsTable = function(localizations){
    // HTML table telling which localizations are mapped to which color
    var container = document.getElementById('localizationList');
    for(localization in localizations){
        var tr = document.createElement("tr");

        var color = document.createElement("td");
        color.style.background = localizations[localization].color;
        tr.appendChild(color);

        var locName = document.createElement("td");
        locName.appendChild(document.createTextNode(localization));
        tr.appendChild(locName);

        container.appendChild(tr);
    }
};