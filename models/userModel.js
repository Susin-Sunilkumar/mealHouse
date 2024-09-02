const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    wallet: {
        type: Number,
        required: true,
    },
    referalcode: {
        type: String,
    },
    
    isBlocked: {
        type: Boolean,
        required: true,
    }
})

module.exports = mongoose.model('User', userSchema)