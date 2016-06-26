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
        origin: {
            type: String,
            required: true,
            unique: true
        },
        entryName:{
            type: String,
            required: true,
            unique: true
        },
        proteinName: {
            type: String,
            required: true
        },
        geneName:{
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
        strict: true
    }));
};