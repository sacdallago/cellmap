/**
 * expressionLigRec model
 *
 * Created by Christian Dallago on 20160513 .
 */

module.exports = function(context) {

    // Imports
    const mongoose = context.mongoose;

    return mongoose.model('features', mongoose.Schema({
        type : {
            type: String,
            required: true,
            default: "Feature"
        },
        geometry : {
            type: {
                type: String,
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
        properties: {
            localization: {
                type: String,
                required: true
            },
            map: {
                type: String,
                required: true
            },
            updatedAt : {
                type: Date,
                default: Date.now
            }
        }
    }, {
        strict: true
    }));
};