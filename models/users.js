/**
 * user model
 *
 * Created by Christian Dallago on 20160626 .
 */

module.exports = function(context) {

    // Imports
    const mongoose = context.mongoose;

    return mongoose.model('users', mongoose.Schema({
        googleId : {
            type: String,
            required: true,
            unique: true
        },
        displayName : {
            type: String
        },
        localizationsOrigins: {
            type: [String],
            required: true,
            default: ['Riken']
        },
        mappingsOrigins: {
            type: [String],
            required: true,
            default: ['Uniprot']
        },
        interactionsOrigins: {
            type: [String],
            required: true,
            default: ['Hippie']
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