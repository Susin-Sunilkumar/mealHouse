const mongoose = require('mongoose')
const Category = require('./categoryModel')
const  product = require('./productModel')
const user = require('./userModel')



const cartSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
    },
    user:{
        type: String,
    },
    productid: {
        type: mongoose.Schema.Types.ObjectId,
    },
    product: {
        type: String,
    },
    price: {
        type: Number,
    },
    quantity: {
        type: Number,
    },
    image: {
        type: String,
    },
})

module.exports = mongoose.model('Cart', cartSchema)