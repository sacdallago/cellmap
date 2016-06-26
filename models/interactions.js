/**
 * interactions model
 *
 * Created by Christian Dallago on 20160530 .
 */

module.exports = function(context) {

    // Imports
    const mongoose = context.mongoose;

    return mongoose.model('interactions', mongoose.Schema({
        edges: {
            type: [String],
            required: true
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 1
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