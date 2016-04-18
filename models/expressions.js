/**
 * expressionLigRec model
 *
 * Created by Christian Dallago on 20160416 .
 */

module.exports = function(context) {

    // Imports
    const mongoose = context.mongoose;

    return mongoose.model('expressions', mongoose.Schema({
        approvedsymbol : {
            type: String,
            required: true,
            unique: true,
            ref: "localization"
        },
        type: {
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