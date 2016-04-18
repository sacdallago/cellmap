/**
 * tissues model
 *
 * Created by Christian Dallago on 20160418 .
 */

module.exports = function(context) {

    // Imports
    const mongoose = context.mongoose;

    return mongoose.model('tissues', mongoose.Schema({
        tissue_id : {
            type: String,
            required: true,
            unique: true
        },
        tissue_name: {
            type: String,
            required: true,
        },
        tissue_group_name: {
            type: String,
            required: true,
        },
        tissue_category: {
            type: String
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