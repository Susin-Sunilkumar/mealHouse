const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
    },
    date: {
        type: Date,
    },
    amount: {
        type: Number,
    },
    creditordebit: {
        type: String,
    },
})

module.exports = mongoose.model('Wallet', walletSchema)