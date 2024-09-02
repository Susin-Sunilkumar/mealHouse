const express = require('express')
const User = require("../models/userModel")
const router = express.Router()
const controller = require("../controllers/cartController")

const checkSessionAndBlocked = async (req, res, next) => {
    if (req.session.userId) {
      const userDetials = await User.findOne({ _id: req.session.userId });
      if (!userDetials.isBlocked) {
        // User is not blocked, proceed to the next middleware or route handler
        next();
      } else {
        // User is blocked, destroy the session and redirect
        req.session.destroy((err) => {
          if (err) {
            console.log("Error destroying session: ", err);
            res.redirect("/");
          } else {
            res.redirect("/");
          }
        });
      }
    } else {
      // No userId in session, redirect to the default page
      res.redirect("/");
    }
  };

router.get('/', checkSessionAndBlocked, controller.getCart)
router.get('/addtocart/:id', controller.getAddCart)
router.get('/addtocartfromwishlist/:id', controller.getAddCartFromWishlist)
router.get('/removefromcart/:id', controller.getRemoveCart)
router.get('/addcartquantity/:id', controller.getAddQuantity)
router.get('/subcartquantity/:id', controller.getSubQuantity)
router.get('/checkout', checkSessionAndBlocked, controller.getCheckOut)
router.post('/placeorder', controller.postPlaceOrder)
router.post('/applycoupon', controller.postApplyCoupon)

module.exports = router;