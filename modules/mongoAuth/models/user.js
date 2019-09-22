const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email:{
        required: true,
        type: String
    },

    password:{
        required: true,
        type: String
    },

    firstName:{
        type: String
    },

    lastName: {
        type: String
    },

    dateCreated: {
        type: Date,
        default: Date.now(),
        required: true
    },

    dateUpdated: {
        type: Date,
        default: Date.now(),
        required: true
    }
})

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;