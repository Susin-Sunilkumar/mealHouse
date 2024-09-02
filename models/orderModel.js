const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
    },
    user:{
        type: String,
    },
    products: [
        {
            productid: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            product: {
                type: String,
            },
            price: {
                type: Number,
            },
            discount: {
                type: Number,
            },
            quantity: {
                type: Number,
            },
            status: {
                type: String,
            },
        }
    ],
    addressid: {
        type: Object,
    },
    paymentmethord: {
        type: String,
    },
    razorpaypaymentid: {
        type: String,
    },
    orderdate: {
        type: Date,
    },
   
  
})

module.exports = mongoose.model('Order', orderSchema)

