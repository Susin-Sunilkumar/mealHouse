const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  applicableProduct: {
    type: String,
  },
  applicableCategorie: {
    type: String,
  },
  discount: {
    type: Number,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Offer", offerSchema);
