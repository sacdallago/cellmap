/**
 * expressionLigRec model
 *
 * Created by Christian Dallago on 20160418 .
 */

module.exports = function(context) {

    // Imports
    const mongoose = context.mongoose;

    return mongoose.model('localizations', mongoose.Schema({
        geneName : {
            type: String,
            required: true,
            unique: true
        },
        uniprotId: {
            type: String,
            required: true,
            unique: true
        },
        localizations: {
            type: [String],
            required: true
        },
        origin: {
            type: String,
            required: true,
            unique: true
        },
        createdAt : {
            type: Date,
            default: Date.now
        },
        updatedAt : {
            type: Date,
            default: Date.now
        }
    }, {
        strict: true
    }));
};