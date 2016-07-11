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
        origin: {
            type: String,
            required: true
        },
        createdAt : {
            type: Date,
            default: Date.now,
            required: true
        },
        updatedAt : {
            type: Date,
            default: Date.now,
            required: true
        }
    }, {
        strict: true
    }));
};