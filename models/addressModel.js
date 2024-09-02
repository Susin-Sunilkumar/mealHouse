const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
    },
    firstname:{
        type: String,
    },
    lastname: {
        type: String,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    pincode: {
        type: String,
    },
    phone: {
        type: Number,
    },
})

module.exports = mongoose.model('Address', addressSchema)