const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");
const User = require("../models/userModel");
// const Order = require("../models/orderModel");
// const Cart = require("../models/cartModel");
// const Address = require("../models/addressModel");

module.exports = {
  getWishlist: async (req, res) => {
    const wishlist = await Wishlist.find({ userid: req.session.userId });
    res.render("user/wishlist", { userId: req.session.userId, wishlist: wishlist });
  },

  addToWishlist: async (req, res) => {
    const userId = req.session.userId;
    const productId = req.params.id;

    const userData = await User.findOne({ _id: userId });
    const productData = await Product.findOne({ _id: productId });
    const newWislist = new Wishlist({
      userid: userData._id,
      user: userData.username,
      productid: productData._id,
      product: productData.productname,
      price: productData.price,
      image: productData.image[0],
    });

    newWislist.save();
    res.redirect("/wishlist");
  },

  removeFromWishlist: async (req, res) => {
    const userId = req.session.userId;
    const productId = req.params.id;
    await Wishlist.findOneAndDelete({ userid: userId, productid: productId })
    res.redirect("/wishlist");
  },
};
