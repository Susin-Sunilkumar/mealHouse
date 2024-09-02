const express = require("express");
const User = require("../models/userModel");
const multer = require("multer");
const router = express.Router();
const controller = require("../controllers/orderController");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  });
const upload = multer({ storage: storage }).array('img', 4);

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

const checkSession = async (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    // No userId in session, redirect to the default page
    res.redirect("/admin/login");
  }
};

router.get("/ordermanagement", checkSession, controller.getOrderManagement);
router.post("/ordrstatus/:id/:productid", upload, controller.postUpdateOrderstatus);
router.get("/usercancelorder/:id/:productid", controller.getUserCancelOrder);
router.get("/userreturnorder/:id/:productid", controller.getUserReturnOrder);
router.get("/admincancelorder/:id/:productid", controller.getAdminCancelOrder);
router.get("/orderdetails/:id/:productid", checkSessionAndBlocked, controller.getOrderDetails);
router.get("/adminorderdetails/:id/:productid", checkSession, controller.getAdminOrderDetails);
router.get("/invoice/:id/:productid", controller.getInvoice);

module.exports = router;
