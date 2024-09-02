const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Category = require("../models/categoryModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Wsihlist = require("../models/wishlistModel");
const Banner = require("../models/bannerModel");
const Offer = require("../models/offerModel");
const Order = require("../models/orderModel");
const Wallet = require("../models/walletModel");
const sendEmail = require("../public/utils/emailService");
const bcrypt = require("bcrypt");

require("dotenv").config();

let referedcode = "";

module.exports = {
  getLogin: (req, res) => {
    if (req.session.userId) {
      res.redirect("/userHome");
    } else {
      const message = req.flash("error");
      res.render("user/login", { message });
    }
  },

  getLogout: (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          res.status(500).send("Error logging out");
        } else {
          res.redirect("/");
        }
      });
    } catch (err) {
      console.error("Error in getLogout:", err);
      res.status(500).send("Error occurred during login. Please try again.");
    }
  },

  postLogin: async (req, res) => {
    const { email, password } = req.body;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^.{1,}$/;

    // Check if email and password meet the required patterns
    if (!emailPattern.test(email) || !passwordPattern.test(password)) {
      return res.render("user/login", {
        message: "Email and password should be valid!",
      });
    }

    try {
      const user = await User.findOne({ email: email });

      if (!user) {
        return res.render("user/login", {
          message: "Email not found. Please sign up!",
        });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);

      // Checking password match
      if (passwordMatch) {
        if (!user.isBlocked) {
          // Adding session details
          req.session.userId = user._id;
          req.session.userName = user.username;

          return res.redirect("/userhome");
        } else {
          return res.render("user/login", {
            message: "This account is blocked!",
          });
        }
      } else {
        return res.render("user/login", {
          message: "Login failed. Incorrect password!",
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error in login.");
    }
  },
  getHome: async (req, res) => {
    try {
      const userId = req.session.userId;
      const products = await Product.find({
        isListed: true,
        stock: { $gt: 0 },
      });
      const wishlistItems = await Wsihlist.find({ userid: req.session.userId });
      const wishlistProductIds = wishlistItems.map((item) => item.productid);

      const wishlistProducts = await Product.find({
        _id: { $in: wishlistProductIds },
      }).select("productname");
      const banners = await Banner.find();

      res.render("user/home", {
        products,
        userId,
        wishlistProducts,
        banners,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get homepage. Please try again.");
    }
  },

  getProduct: async (req, res) => {
    try {
      const product = await Product.findOne({ _id: req.params.id });
      const category = await Category.findOne({ _id: product.category });
      const offer = await Offer.findOne({
        $or: [
          { applicableProduct: product.productname },
          { applicableCategorie: category.category },
        ],
      });
      res.render("user/productPreview", {
        product,
        offer,
        userId: req.session.userId,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get productpage.");
    }
  },

  getRegistration: (req, res) => {
    try {
      res.render("user/signup", { message: null });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get registratiion.");
    }
  },

  postRegistration: async (req, res) => {

    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const referedcode = req.body.referedcode.trim();
    const password = req.body.password.trim();
    console.log("this is the referedcode from the other user: ", referedcode);

    req.session.data = req.body;

    if (req.body.referedcode != "") {
      req.session.referedcode = req.body.referedcode;
      console.log(req.session.referedcode, "saving in the session");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const data = await User.findOne({ email: email });

    if (
      username === null ||
      username.trim() === "" ||
      password === null ||
      password.trim() === ""
    ) {
      res.render("user/signup", {
        message: "Enter valid username and password!",
      });
    } else {
      if (!emailPattern.test(email)) {
        res.render("user/signup", { message: "Email not valid!" });
      } else {
        if (data == null) {
          //OTP generator

          res.redirect("/otpVerification");
          console.log("going to post registration");
        } else {
          req.flash(
            "error",
            `Email already exists. Please login with the email account: ${email}`
          );
          res.redirect("/");
        }
      }
    }
  },

  getOtpVerification: async (req, res) => {
    try {
      const { email } = req.session.data;
      console.log("this should be the email", email);
      const generateOTP = (length) => {
        const digits = "0123456789";
        let OTP = "";

        for (let i = 0; i < length; i++) {
          const randomIndex = crypto.randomInt(0, digits.length);
          OTP += digits[randomIndex];
        }

        return OTP;
      };

      //EmailSending
      const sendOtpEmail = async (email, otp) => {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "One-Time Password (OTP) for Authentication for MealHouse",
          html: `
            <p>Your opt for <h3 style="color: orange;">MealHouse Login</h3> </p>
            <h1 style="color: red;">${otp}</h1>
          `, // Use html instead of text
        };

        transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            return console.error("Error:", error);
          }
          console.log("Email sent:", info.response);
        });
      };

      const generateReferralCode = (length) => {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let referralCode = "";

        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          referralCode += characters[randomIndex];
        }

        return referralCode;
      };

      req.session.referalcode = generateReferralCode(8);

      const otp = generateOTP(6);
      console.log(otp, "this is the otp");
      req.session.otp = otp;
      await sendOtpEmail(email, otp);

      res.render("user/otpVerification", { message: null, email });
    } catch (err) {
      console.log(err);
    }
  },

  postOtpVerification: async (req, res) => {
    const { otp } = req.body;
    const sessionOtp = req.session.otp;
    let iseligible = false;

    if (otp === sessionOtp) {
      const userData = req.session.data;

     

      const referedcode = req.session.referedcode;

      console.log("Post Otp Verifaication the referred code", referedcode);

      if (referedcode != "") {
        const isReferalValid = await User.findOne({ referalcode: referedcode });

        console.log('checking the isreferalValid or not',isReferalValid)

        if (isReferalValid != null) {
          console.log("referalcode valid");
          iseligible = true;
          await User.updateOne(
            { referalcode: referedcode },
            { $inc: { wallet: 100 } }
          );
        } else {
          console.log("referalcode invalid");
        }
      }

      console.log("the password from the user data :", userData.password);

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const newUser = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        wallet: iseligible ? 50 : 0,
        referalcode: req.session.referalcode,
        isBlocked: false,
      });

      try {
        const savedUser = await newUser.save();

        // Set the session with the user ID from the saved user
        req.session.userId = savedUser._id; // Assuming the user ID field in your model is "_id"

        res.json({ success: true, redirectUrl: "/" });
      } catch (err) {
        // Handle the error if the user couldn't be saved
        console.error("Error saving user to the database:", err);
        res.json({
          success: false,
          message: "Error saving user. Please try again.",
        });
      }
    } else {
      res.json({ success: false, message: "OTP is incorrect! Try again." });
    }
  },

  getProfile: async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findOne({ _id: id });
      res.render("user/profile", { user });
    } catch (err) {
      console.log(err);
    }
  },

  getAddress: async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await User.findOne({ _id: userId });
      const addresses = await Address.find({ userid: userId });
      res.render("user/address", { user, userId, addresses });
    } catch (err) {
      console.log(err);
    }
  },
  getWallet: async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await User.findOne({ _id: userId });
      const wallethistory = await Wallet.find({ userid: userId });
      res.render("user/wallet", { user, userId, wallethistory });
    } catch (err) {
      console.log(err);
    }
  },
  getAddAddress: async (req, res) => {
    try {
      res.render("user/addaddress");
    } catch (err) {
      console.log(err);
    }
  },

  postAddAddress: async (req, res) => {
    const { firstname, lastname, address, city, state, pincode, phone } =
      req.body;
    const newAddress = new Address({
      userid: req.session.userId,
      firstname: firstname,
      lastname: lastname,
      address: address,
      city: city,
      state: state,
      pincode: pincode,
      phone: phone,
    });

    try {
      newAddress.save();
      res.redirect("/useraddress");
    } catch (err) {
      console.log("Error saving address: ", err);
    }
  },

  getAddressEdit: async (req, res) => {
    try {
      const addressData = await Address.findOne({ _id: req.params.id });
      res.render("user/editaddress", { addressData });
    } catch (err) {
      console.log(err);
    }
  },

  postAddressEdit: async (req, res) => {
    try {
      await Address.updateOne(
        { _id: req.params.id },
        {
          $set: {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            phone: req.body.phone,
          },
        }
      );
      res.redirect("/useraddress");
    } catch (err) {
      console.log("Error updating address: ", err);
    }
  },

  getAddressDelete: async (req, res) => {
    const addressId = req.params.id;
    try {
      await Address.findByIdAndDelete(addressId);
    } catch (err) {
      console.log("Error deleting the address: ", err);
    }
    res.redirect("/useraddress");
  },

  getOrders: async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await User.findOne({ _id: userId });
      const orders = await Order.find({ userid: userId }).sort({
        orderdate: -1,
      });
      res.render("user/orders", { user, userId, orders });
    } catch (err) {
      console.log("Error getting orders: ", err);
    }
  },

  getCancelOrder: async (req, res) => {
    try {
      const orderId = req.params.id;
      await Order.findByIdAndDelete(orderId);
      res.redirect("/orders");
    } catch (err) {
      console.log("Error in canceling orders: ", err);
    }
  },

  getSearch: async (req, res) => {
    // try {
    //   const searchQuery = req.query.search;
    //   let filter = {};

    //   if (searchQuery) {
    //     const regexPattern = new RegExp(searchQuery, "i");
    //     filter = { productname: { $regex: regexPattern } };
    //     const filteredProducts = await Product.find(filter);
    //     res.json(filteredProducts);
    //   } else {
    //     const firstFourProducts = await Product.find({}).limit(4);
    //     res.json(firstFourProducts);
    //   }
    // } catch (err) {
    //   console.log(err);
    //   res.status(500).json({ error: "Internal Server Error" });
    // }
    try {
      const searchQuery = req.query.search;
      let productFilter = {};
      let categoryFilter = {};

      if (searchQuery) {
        const regexPattern = new RegExp(searchQuery, "i");

        // Find products matching the query
        productFilter = { productname: { $regex: regexPattern } };

        // Find categories matching the query
        categoryFilter = { category: { $regex: regexPattern } };
      }

      const matchingProducts = await Product.find(productFilter).populate(
        "category"
      );
      const matchingCategories = await Category.find(categoryFilter);
      const response = {
        products: matchingProducts,
        categories: matchingCategories,
      };

      res.json(response);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error while searaching." });
    }
  },

  getShop: async (req, res) => {
    try {
      const userId = req.session.userId;
      const productsByCategory = await Product.aggregate([
        {
          $match: { isListed: true, stock: { $gt: 0 } },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo",
          },
        },
        {
          $unwind: "$categoryInfo",
        },
        {
          $group: {
            _id: "$categoryInfo.category",
            products: {
              $push: "$$ROOT",
            },
          },
        },
      ]);
      const products = await Product.find({
        isListed: true,
        stock: { $gt: 0 },
      });
      const wishlistItems = await Wsihlist.find({ userid: req.session.userId });
      const wishlistProductIds = wishlistItems.map((item) => item.productid);

      const wishlistProducts = await Product.find({
        _id: { $in: wishlistProductIds },
      }).select("productname");
      res.render("user/shop", {
        products,
        productsByCategory,
        userId,
        wishlistProducts,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error getting shop.");
    }
  },

  getShopByCategory: async (req, res) => {
    try {
      const userId = req.session.userId;
      const categoryName = req.params.category;
      const category = await Category.findOne({ category: categoryName });
      const products = await Product.find({ category: category._id });
      const wishlistItems = await Wsihlist.find({ userid: req.session.userId });
      const wishlistProductIds = wishlistItems.map((item) => item.productid);

      const wishlistProducts = await Product.find({
        _id: { $in: wishlistProductIds },
      }).select("productname");
      res.render("user/shopbycategory", {
        products,
        userId,
        categoryName,
        wishlistProducts,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error getting shop by category.");
    }
  },

  postSortProducts: async (req, res) => {
    try {
      let products;
      const categoryDetails = await Category.findOne({
        category: req.body.category,
      });
      const wishlist = await Wsihlist.find();
      if (req.body.order == "asc") {
        products = await Product.find({ category: categoryDetails._id }).sort({
          price: 1,
        });
      } else if (req.body.order == "desc") {
        products = await Product.find({ category: categoryDetails._id }).sort({
          price: -1,
        });
      } else {
        products = await Product.find({ category: categoryDetails._id });
      }
      res.json({ products: products, wishlist });
    } catch (err) {
      console.log("Error sorting products: ", err);
    }
  },

  getTrail: (req, res) => {
    try {
      res.render("user/traillogin", { message: null });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get trail.");
    }
  },

  postForgotPassword: async (req, res) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      console.log(user);

      if (!user) {
        return res
          .status(404)
          .json({ message: "No account with that email found." });
      }

      // Generate a reset token
      const resetToken = crypto.randomBytes(20).toString("hex");

      // Set token and expiry on the user model
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

      await user.save();
      console.log("resetToken :", resetToken);

      // Send reset email
      const resetUrl = `http://${req.headers.host}/reset-password?token=${resetToken}`;
      const logoUrl = `https://i.imgur.com/UlHs7xr.png`; // Public URL of the image

      const message = `
<div style="font-family: Arial, sans-serif; color: #333;">
    <div style="text-align: center; padding: 20px; background-color: #f7f7f7;">
      <img src="${logoUrl}" alt="Designer Image" style="width: 150px; height: auto;">
    </div>
     <h2 class="first-heading">WELCOME BACK...TO..</h2>
                <h1 style="color: #f56318; background-color:#00000000; padding: 10px; border-radius: 5px;">MealHouse</h1>
    <div style="padding: 20px; background-color: #fff; border: 1px solid #ddd;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p style="color: #333;">Hello,</p>
      <p style="color: #333;">We received a request to reset your password. Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; margin-top: 10px; background-color: #28a745; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p style="margin-top: 20px;color:red ;font-weight:400;font-size:1rem">If you did not request a password reset, please ignore this email.</p>
      <p style="color: #333;">Thank you,</p>
      <p style="color: #333;">The Meal House Team</p>
    </div>
    <div style="text-align: center; padding: 20px; background-color: #f7f7f7;">
      <p style="font-size: 12px; color: #888;">&copy; 2024 Meal House. All rights reserved.</p>
    </div>
  </div>

`;

      console.log("going to sent link for resetting the password");

      await sendEmail({
        email: user.email,
        subject: "Password Reset",
        html: message,
      });

      console.log("message sent successfull");

      res.json({ message: "Password reset link sent to your email." });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error sending password reset email." });
    }
  },

  getForgotPassword: (req, res) => {
    const token = req.query.token;
    res.render("reset-password", { token });
  },
  restPassword: async (req, res) => {
    const { token, password, passwordConfirm } = req.body;

    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Password reset token is invalid or has expired." });
      }

      if (password !== passwordConfirm) {
        return res.status(400).json({ message: "Passwords do not match." });
      }

      // Update the user's password
      user.password = await bcrypt.hash(password, 10); // Hash the new password
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.json({ message: "Password has been reset successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error resetting password." });
    }
  },
};
