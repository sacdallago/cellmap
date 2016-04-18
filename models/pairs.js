/**
 * expressionLigRec model
 *
 * Created by Christian Dallago on 20160417 .
 */

module.exports = function(context) {

    // Imports
    const mongoose = context.mongoose;

    return mongoose.model('pairs', mongoose.Schema({
        pair_name : {
            type: String,
            required: true,
            unique: true
        },
        ligand_approvedsymbol: {
            type: String,
            required: true,
            ref: "localization"
        },
        receptor_approvedsymbol: {
            type: String,
            required: true,
            ref: "localization"
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