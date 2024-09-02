const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminController");
const nocache = require("nocache");
const path = require('path')
const multer = require("multer");
router.use(nocache());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + ext
    );
  },
});

const imageFilter = function (req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|img)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: imageFilter
}).single('img');



const checkSession = async (req, res, next) => {
  
  if (req.session.admin) { 
    
    next();
  } else {
    // No userId in session, redirect to the default page
    res.redirect("/admin/login");
   
  }
};


//! Authentication routes
router.get("/login", controller.getLogin);
router.post("/login", controller.postLogin);
router.get("/logout", controller.getLogout);

router.use(checkSession)


//! Dashboard routes
router.get("/dashboard",controller.getAdminDashboard);

//! User Management routes
router.get("/usermanagement", controller.getUserManagement);
router.get("/blockuser/:id", controller.getBlockUser);

//! Category Management routes
router.get("/categorymanagement", controller.getCategoryManagement);
router.get("/addcategory", controller.getAddCategory);
router.post("/addcategory", controller.postAddCategory);
router.get("/deletecategory/:id", controller.getDeleteCategory)
router.get("/editcategory/:id",controller.getEditCategory)
router.post("/editcategory/:id",controller.postEditCategory)


//!offer management routes
router.get("/offermanagement", checkSession, controller.getOfferManagement);

router.get("/addoffer", checkSession, controller.getOffer);






router.get("/deleteoffer/:id", controller.getDeleteOffer);
router.post("/addoffer", controller.postOffer);

router.get("/bannermanagement", checkSession, controller.getBannerManagement);
router.get("/addbanner", checkSession, controller.getBanner);
router.get("/deletebanner/:id", controller.getDeleteBanner);
router.post("/addbanner",upload, controller.postBanner);
router.get("/couponmanagement", checkSession, controller.getCouponManagement);
router.get("/addcoupon", checkSession, controller.getCoupon);
router.get("/deletecoupon/:id", controller.getDeleteCoupon);
router.get("/editcoupon/:id", checkSession, controller.getEditCoupon);
router.post("/addcoupen/:id", controller.postEditCoupen);
router.post("/addcoupen", controller.postCoupen);



router.get("/generate-pdf", controller.getGeneratePdf);
router.get("/salesreport", controller.getExcelReprot);



module.exports = router;