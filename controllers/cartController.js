const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Coupon = require("../models/coupenModel");

const Wishlist = require("../models/wishlistModel");

const Offer = require("../models/offerModel");

module.exports = {
  getCart: async (req, res) => {
    const cart = await Cart.find({ userid: req.session.userId });
    const offersForProducts = [];
  for (const cartItem of cart) {
    const product = await Product.findById(cartItem.productid);
    const category = await Category.findById(product.category);

    const offer = await Offer.findOne({ $or: [ { applicableProduct: product.productname }, { applicableCategorie: category.category } ] });

    offersForProducts.push({
      cart: cartItem,
      offer: offer ? offer : null,
    });
  }
    res.render("user/cart", {  cart,  offers: offersForProducts,  userId: req.session.userId,  });
  },

  getAddCart: async (req, res) => {
    const userId = req.session.userId;
    const productId = req.params.id;
    const cart = await Cart.findOne({ userid: userId, productid: productId });
    if (cart != null) {
      const product = await Product.findById(cart.productid);
      if (product.stock > cart.quantity) {
        cart.quantity++;
        cart.save();
      }
      const productData = await Product.findOne({ _id: productId });
      res.redirect("/cart");
    } else {
      const userData = await User.findOne({ _id: userId });
      const productData = await Product.findOne({ _id: productId });
      const newCart = new Cart({
        userid: userData._id,
        user: userData.username,
        productid: productData._id,
        product: productData.productname,
        price: productData.price,
        quantity: 1,
        image: productData.image[0],
      });

      newCart.save();
      res.redirect("/cart");
    }
  },

  getAddCartFromWishlist: async (req, res) => {
    const userId = req.session.userId;
    const productId = req.params.id;
    const cart = await Cart.findOne({ userid: userId, productid: productId });
    if (cart != null) {
      cart.quantity++;
      cart.save();
      const productData = await Product.findOne({ _id: productId });
      res.redirect("/cart");
    } else {
      const userData = await User.findOne({ _id: userId });
      const productData = await Product.findOne({ _id: productId });
      const newCart = new Cart({
        userid: userData._id,
        user: userData.username,
        productid: productData._id,
        product: productData.productname,
        price: productData.price,
        quantity: 1,
        image: productData.image[0],
      });

      newCart.save();
      await Wishlist.findOneAndDelete({ userid: userId, productid: productId });
      res.redirect("/cart");
    }
  },

  getRemoveCart: async (req, res) => {
    const productId = req.params.id;
    const cart = await Cart.findByIdAndDelete(productId);
    res.redirect("/cart");
  },

  getAddQuantity: async (req, res) => {
    const productId = req.params.id;
    const cart = await Cart.findOne({ _id: productId });
    const product = await Product.findById(cart.productid);
    if (product.stock > cart.quantity) {
      cart.quantity++;
      cart.save();
      res.json({ updatedQuantity: cart.quantity });
    } else {
      res.json({ message: "Maximum stock reached" });
    }
  },

  getSubQuantity: async (req, res) => {
    const productId = req.params.id;
    const cart = await Cart.findOne({ _id: productId });
    if (cart.quantity > 1) {
      cart.quantity--;
      cart.save();
      res.json({ updatedQuantity: cart.quantity });
    } else {
      res.redirect("/cart");
    }
  },

  getCheckOut: async (req, res) => {
    const userData = await User.findOne({ _id: req.session.userId });
    const cart = await Cart.find({ userid: req.session.userId });
    const addresses = await Address.find({ userid: req.session.userId });
    const coupons = await Coupon.find()
    const offersForProducts = [];
  for (const cartItem of cart) {
    const product = await Product.findById(cartItem.productid);
    const category = await Category.findById(product.category);

    const offer = await Offer.findOne({ $or: [ { applicableProduct: product.productname }, { applicableCategorie: category.category } ] });

    offersForProducts.push({
      cart: cartItem,
      offer: offer ? offer : null,
    });
  }
    res.render("user/checkout", {
      userid: req.session.userId,
      cart,
      offers: offersForProducts,
      addresses,
      userData,
      coupons,
    });
  },

  postPlaceOrder: async (req, res) => {
    try {
      console.log(req.body)
      const userData = await User.findOne({ _id: req.session.userId });
      const cart = await Cart.find({ userid: req.session.userId });
      const currentDate = new Date();
      const discountAmount = parseFloat(req.body.discountprice);
      const address = await Address.findById(req.body.address);
      const couponCode = req.body.appliedCouponCode
      let totalAmount = 0;
      let totalItems = 0;
      const productsForOrder = [];

      for (const item of cart) {
        totalItems++;
      }

      const perItemDiscount = Math.floor(discountAmount / totalItems);

      const offersForProducts = [];
  for (const cartItem of cart) {
    const product = await Product.findById(cartItem.productid);
    const category = await Category.findById(product.category);

    const offer = await Offer.findOne({ $or: [ { applicableProduct: product.productname }, { applicableCategorie: category.category } ] });

    offersForProducts.push({
      cart: cartItem,
      offer: offer ? offer : null,
    });
  }

      for (const offer of offersForProducts) {
        totalAmount += offer.offer ? (offer.cart.price - (offer.cart.price * (offer.offer.discount / 100))) * offer.cart.quantity : offer.cart.price * offer.cart.quantity;
        const productForOrder = {
          productid: offer.cart.productid,
          product: offer.cart.product,
          price: offer.offer ? (offer.cart.price - (offer.cart.price * (offer.offer.discount / 100))) : offer.cart.price,
          discount: perItemDiscount,
          quantity: offer.cart.quantity,
          status: "pending",
        };
        productsForOrder.push(productForOrder);
      }

      const totalAfterDiscount = totalAmount - discountAmount;
      const newOrder = new Order({
        userid: req.session.userId,
        user: userData.username,
        products: productsForOrder,
        addressid: address,
        paymentmethord: req.body.payment,
        orderdate: currentDate,
      });

      await newOrder.save();

      // Update product stock and perform wallet operations as before
      for (const item of cart) {
        await Product.updateOne(
          { _id: item.productid },
          { $inc: { stock: -item.quantity } }
        );
      }

      if (req.body.payment === "Wallet") {
        await User.updateOne(
          { _id: req.session.userId },
          { $inc: { wallet: -totalAfterDiscount } }
        );

        let total = 0;
        for (const item of cart) {
          total += item.price * item.quantity;
        }
        total = totalAfterDiscount;

        const newWallet = new Wallet({
          userid: req.session.userId,
          date: currentDate,
          amount: total,
          creditordebit: "debit",
        });
        await newWallet.save();
      }

      if(discountAmount != 0 && couponCode != ''){
        const couponData = await Coupon.findOne({ code: couponCode })
        couponData.usedUsers.push(req.session.userId)
        await couponData.save();
      }

      await Cart.deleteMany({ userid: req.session.userId });
      res.render("user/orderconfirm");
    } catch (error) {
      // Handle any potential errors here
      console.error("Error placing order:", error);
      res.status(500).send("Failed to place order. Please try again.");
    }
  },

  // old placeorder
  // postPlaceOrder: async (req, res) => {
  //   const cart = await Cart.find({ userid: req.session.userId });
  //   const currentDate = new Date();
  //   const discountAmount = parseFloat(req.body.discountprice);
  //   const address = await Address.findById(req.body.address)
  //   let totalAmount = 0;
  //   for (const item of cart) {
  //     totalAmount += item.price * item.quantity;
  //   }

  //   const totalAfterDiscount = totalAmount - discountAmount;
  //   for (const item of cart) {
  //     const newOrder = new Order({
  //       userid: item.userid,
  //       user: item.user,
  //       productid: item.productid,
  //       product: item.product,
  //       price: item.price,
  //       discount: discountAmount,
  //       quantity: item.quantity,
  //       addressid: address,
  //       paymentmethord: req.body.payment,
  //       orderdate: currentDate,
  //       status: "pending",
  //     });

  //     newOrder.save();
  //     await Product.updateOne(
  //       { _id: item.productid },
  //       { $inc: { stock: -item.quantity } }
  //     );
  //   }
  //   if (req.body.payment == "Wallet") {
  //     await User.updateOne(
  //       { _id: req.session.userId },
  //       { $inc: { wallet: -totalAfterDiscount } }
  //     );
  //     let total = 0
  //     for (const item of cart) {
  //       total += item.price * item.quantity
  //     }
  //     total = total - discountAmount
  //     const newWallet = new Wallet({
  //       userid: req.session.userId,
  //       date: currentDate,
  //       amount: total,
  //       creditordebit: 'debit',
  //     });
  //     newWallet.save();
  //   }
  //   await Cart.deleteMany({ userid: req.session.userId });
  //   res.render("orderconfirm");
  // },

  // postApplyCoupon: async (req, res) => {
  //   const { couponCode } = req.body;
  //   const coupon = await Coupon.findOne({ code: couponCode });
  //   let discount = 0;
  //   let totalPriceAfterDiscount = 500;
  //   if(coupon != null) {
  //     discount = coupon.discount
  //   }
  //   res.json({ discount: discount, totalPrice: totalPriceAfterDiscount });
  // },
  postApplyCoupon: async (req, res) => {
    const userId = req.session.userId
    const { couponCode, totalPrice } = req.body;
    const pricesString = req.body.prices;
    const prices = pricesString.split(',').map(Number);
    const coupon = await Coupon.findOne({ code: couponCode });
    let isUsed = true;
    let isExpired = false;
    let isValid = true;
    let isLimit = true;
    let discount = 0;
    let isLimitForPrice = true
    if (coupon != null) {
      const currentDate = new Date();
      const expiryDate = new Date(coupon.expiryDate);

      if (currentDate <= expiryDate) {
        prices.forEach(price => {
          if(coupon.discount > price){
            isLimitForPrice = false
          }
        })
        if(!coupon.usedUsers.some(usedUser => usedUser.toString() === userId)){
          isUsed = false
        }
        if (totalPrice >= coupon.limit && isLimitForPrice && !isUsed) {
          discount = coupon.discount;
        } else {
          isLimit = false;
        }
      } else {
        isExpired = true;
      }
    } else {
      isValid = false;
    }
    console.log('isUsed : ', isUsed)

    if(coupon != null){
      res.json({
        discount: discount,
        code: coupon.code != null ? coupon.code : '',
        isExpired: isExpired,
        isValid: isValid,
        isLimit: isLimit,
        isUsed: isUsed,
      });
    } else {
      res.json({
        discount: discount,
        code: '',
        isExpired: isExpired,
        isValid: isValid,
        isLimit: isLimit,
        isUsed: isUsed,
      });
    }
  },

  // postApplyCoupon: async (req, res) => {
  //   const { couponCode, totalPrice } = req.body;
  //   const pricesString = req.body.prices;
  //   const prices = pricesString.split(',').map(Number);
  //   const coupon = await Coupon.findOne({ code: couponCode });
  //   let isExpired = false;
  //   let isValid = true;
  //   let isLimit = true;
  //   let discount = 0;
  //   let isLimitForPrice = true
  //   if (coupon != null) {
  //     const currentDate = new Date();
  //     const expiryDate = new Date(coupon.expiryDate);

  //     if (currentDate <= expiryDate) {
  //       prices.forEach(price => {
  //         if(coupon.discount > price){
  //           isLimitForPrice = false
  //         }
  //       })
  //       if (totalPrice >= coupon.limit && isLimitForPrice) {
  //         discount = coupon.discount;
  //       } else {
  //         isLimit = false;
  //       }
  //     } else {
  //       isExpired = true;
  //     }
  //   } else {
  //     isValid = false;
  //   }

  //   res.json({
  //     discount: discount,
  //     isExpired: isExpired,
  //     isValid: isValid,
  //     isLimit: isLimit,
  //   });
  // },

  postOrderPayment: async (req, res) => {
    try {
      var instance = new Razorpay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.KEY_SECRET,
      });
      var options = {
        amount: totalPrice,
        currency: "INR",
        receipt: "order_rcptid_11",
      };

      // Creating the order
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.error(err);
          res.status(500).send("Error creating order");
          return;
        }

        console.log(order);
        // Add orderprice to the response object
        res.send({ orderId: order.id });

        // Replace razorpayOrderId and razorpayPaymentId with actual values
        var {
          validatePaymentVerification,
          validateWebhookSignature,
        } = require("./dist/utils/razorpay-utils");
        validatePaymentVerification(
          { order_id: order.id, payment_id: razorpayPaymentId }, // Make sure razorpayPaymentId is defined
          signature, // Make sure signature is defined
          secret
        );

        // Redirect to /orderdata on successful payment
        res.redirect("/orderdata");
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to create order.");
    }
  },
};
