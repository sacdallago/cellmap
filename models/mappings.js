/**
 * mappings model
 *
 * Created by Christian Dallago on 20160530 .
 */

module.exports = function(context) {

    // Imports
    const mongoose = context.mongoose;

    return mongoose.model('mappings', mongoose.Schema({
        uniprotId : {
            type: String,
            required: true,
            unique: true
        },
        geneId: {
            type: String,
            required: true
        },
        entryName:{
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