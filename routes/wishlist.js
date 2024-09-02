const express = require('express')
const User = require("../models/userModel")
const router = express.Router()
const controller = require("../controllers/wishlistController")

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

router.get('/', checkSessionAndBlocked, controller.getWishlist)
router.get('/addtowishlist/:id', controller.addToWishlist)
router.get('/removefromwishlist/:id', controller.removeFromWishlist)

module.exports = router;