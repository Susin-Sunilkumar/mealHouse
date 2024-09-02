const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
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
    image: {
        type: String,
    },
})

module.exports = mongoose.model('Wishlist', wishlistSchema)