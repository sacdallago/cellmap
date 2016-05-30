/**
 * expressionLigRec model
 *
 * Created by Christian Dallago on 20160418 .
 */

module.exports = function(context) {

    // Imports
    const mongoose = context.mongoose;

    return mongoose.model('localizations', mongoose.Schema({
        approvedsymbol : {
            type: String,
            required: true,
            unique: true
        },
        uniprotac: {
            type: String,
            required: true,
            unique: true
        },
        consensus_sl: {
            type: [String],
            required: true
        },
        geneId: {
            type: String
        },
        entryName:{
            type: String,
            required: true
        },
        "6class_consensus_sl": {
            type: String,
            required: true
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
        strict: false
    }));
};