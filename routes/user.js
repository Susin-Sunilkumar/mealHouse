const express = require('express')
const router = express.Router()
const User = require("../models/userModel");
const controller = require('../controllers/userController')
const nocache = require('nocache')
router.use(nocache())

router.use(express.json())

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

  const checkSessionOnlyForOtp = (req, res, next) => {
    if (req.session.userId) {
      // Session exists, redirect to user home page
      res.redirect('/userHome');
    } else {
      // No session, proceed to the OTP verification page
      next();
    }
  };



//! Authentication routes
router.get('/', controller.getLogin)
router.post('/', controller.postLogin)

//!home routes
router.get('/userHome', checkSessionAndBlocked, controller.getHome)
router.get('/product/:id', checkSessionAndBlocked, controller.getProduct)

//!signup routes
router.get('/userSignup',checkSessionOnlyForOtp, controller.getRegistration)
router.post('/userSignup',checkSessionOnlyForOtp, controller.postRegistration)


//!   forgot password route
router.post('/forgot-password', controller.postForgotPassword)
router.get('/reset-password',controller.getForgotPassword)
router.post('/reset-password',controller.restPassword)




//!otpVerification routes
router.get('/otpVerification',checkSessionOnlyForOtp, controller.getOtpVerification)
router.post('/otpVerification',checkSessionOnlyForOtp, controller.postOtpVerification)

router.get('/userprofile/:id', checkSessionAndBlocked, controller.getProfile)
router.get('/useraddress', checkSessionAndBlocked, controller.getAddress)
router.get('/wallet', checkSessionAndBlocked, controller.getWallet)
router.get('/addaddress', controller.getAddAddress)
router.post('/addaddress', controller.postAddAddress)
router.get('/addressedit/:id', controller.getAddressEdit)
router.post('/addressedit/:id', controller.postAddressEdit)
router.get('/addressdelete/:id', controller.getAddressDelete)
router.get('/orders', checkSessionAndBlocked, controller.getOrders)
router.get('/cancelorder/:id', controller.getCancelOrder)
router.get('/search', controller.getSearch)
router.get('/shop', checkSessionAndBlocked, controller.getShop)
router.get('/shop/:category', checkSessionAndBlocked, controller.getShopByCategory)
router.post('/sortProducts', controller.postSortProducts)

// user profile
router.get('/trail',controller.getTrail)



router.get('/logout', controller.getLogout)



module.exports = router  