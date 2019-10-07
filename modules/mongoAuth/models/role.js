const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    read: {
        type: Array,
        default: []
    },

    write: {
        type: Array,
        default: []
    },

    see: {
        type: Array,
        default: []
    },

    editRoles: {
        type: Boolean,
        default: false
    },

    removeRoles: {
        type: Boolean,
        default: false
    }
})

const roleModel = mongoose.model("role", roleSchema);

module.exports = roleModel;