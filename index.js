/**
 * Entry point
 *
 * Created by Christian Dallago on 20160416 .
 */


var context;

module.exports = {
    start: function(callback) {
        callback = callback || function(){};
        
        const mongoose    = require('mongoose');
        const fs          = require('fs');
        const path        = require('path');
        const q           = require('q');

        // Initialize the context
        context = {
            fs              : fs,
            mongoose        : mongoose,
            path            : path,
            promises        : q
        };

        // Function to load all components from the respective folders (models, controllers, services, daos, utils)
        context.component = function(componentName) {
            if (!context[componentName]) {
                context[componentName] = {};
            }

            return {
                module: function(moduleName) {
                    if (!context[componentName][moduleName]) {
                        console.log('Loading component ' + componentName);
                        context[componentName][moduleName] = require(path.join(__dirname, componentName, moduleName))(context,
                                                                                                                      componentName, moduleName);
                        console.log('LOADED ' + componentName + '.' + moduleName);
                    }

                    return context[componentName][moduleName];
                }
            }
        };
        
        callback();
        return context;
    }
}