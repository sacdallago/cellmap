var url = 'http://www.uniprot.org/uniprot/?compress=no&query=reviewed:yes%20AND%20organism:9606&columns=id,entry%20name,protein%20names,genes(PREFERRED),comment(SUBCELLULAR%20LOCATION)&format=tab';

const source = require(__dirname + "/../" + 'data/' + 'uniprot.json');
const fs = require('fs');

var allLocalizations = source.map(function(t){
    // Get the subcellular location field for each field
    var uniprotNotation = t['subcellular location [cc]'];

    // Replace places in which "SUBCELLULAR LOCATION:", or other text followed by semi-colon ("isoform 1:", "angiotensin-converting enzyme, soluble form:")
    uniprotNotation = uniprotNotation.replace(/[A-z|0-9|\-|,|\s]+:/g,'');

    // Replace ; with dot .
    uniprotNotation = uniprotNotation.replace(/;/g,'.');
    
    // Remove "Note=.... ." text
    uniprotNotation = uniprotNotation.replace(/Note=.+\./g,'');

    // Split into the different locations by following the '. ' (dot-space) pattern
    uniprotNotation = uniprotNotation.split('. ');

    // Filter locations based on the ones that I really consider/want
    uniprotNotation = uniprotNotation.map(function(element){
        
        element = element.toLowerCase();

        // Replace stupid dot at the end of last location
        element = element.replace(/\./g,'');

        // Replace stupid spaces at the beginning of last location
        element = element.replace(/^ /,'');

        // Replace bracketed stuff
        element = element.replace(/ \{.+}/g,'');

        // Don't filter if it is an empty string
        if(element.length > 0){
            return element;
        }
    }).filter(function(element){
        return element !== undefined;
    });

    return uniprotNotation;
});

var uniqueLocations = [];

allLocalizations.forEach(function(groupLoc){
    groupLoc.forEach(function(singleLoc){
        if(!uniqueLocations.find(function(element){
            return element == singleLoc;
        })){
            uniqueLocations.push(singleLoc);
        }
    });
});


fs.writeFile(__dirname + "/../" + 'data/' + 'allLocs.json', uniqueLocations.join('\n'), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log(uniqueLocations.length + ' unique locs saved!');
}); 