const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Offer = require("../models/offerModel");
const Address = require("../models/addressModel");
const Coupon = require("../models/coupenModel");
const Banner = require("../models/bannerModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Order = require("../models/orderModel")
const PDFDocument  = require('pdfkit-table')
const ExcelJS = require('exceljs')

require("dotenv").config();

module.exports = {
  getGeneratePdf: async (req, res) => {
    try {
      const startingDate = new Date(req.query.startingdate);
      const endingDate = new Date(req.query.endingdate);
  
      // Fetch orders within the specified date range
      const orders = await Order.find({
        orderdate: { $gte: startingDate, $lte: new Date(endingDate.getTime() + 86400000) },
        "products.status": "Delivered",
      });
      let addressDetails
      for(let address of orders){
          addressDetails = await Address.findById(address.addressid);
        ;
      }
      console.log(orders)
      // Create a PDF document
      const doc = new PDFDocument();
      const filename = "sales_report.pdf";
  
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/pdf");
  
      doc.pipe(res);
  
      // Add content to the PDF document
      doc.text("Sales Report", { align: "center", fontSize: 10, margin: 2 });
  
      // Define the table data
      const tableData = {
        headers: [
          "Username",
          "Product Name",
          "Price",
          "Quantity",
          "Address",
          "City",
          "Pincode",
          "Phone",
        ],
        // rows: orders.map((order) => [
        //   order.user,
        //   order.products.map((product) => product.product).join(", "),
        //   order.products.map((product) => product.price).join(", "),
        //   order.products.map((product) => product.quantity).join(", "),
        //   addressDetails.address,
        //   addressDetails.city,
        //   addressDetails.pincode,
        //   addressDetails.phone,
        // ]),
        rows: orders.map(order => [
          order.user,
          order.products
            .filter(product => product.status === "Delivered")
            .map(product => product.product)
            .join(", "),
          order.products
            .filter(product => product.status === "Delivered")
            .map(product => product.price)
            .join(", "),
          order.products
            .filter(product => product.status === "Delivered")
            .map(product => product.quantity)
            .join(", "),
          addressDetails.address,
          addressDetails.city,
          addressDetails.pincode,
          addressDetails.phone,
        ]),

      };
  
      // Draw the table
      await doc.table(tableData, {
        prepareHeader: () => doc.font("Helvetica-Bold"),
        prepareRow: () => doc.font("Helvetica"),
      });
  
      // Finalize the PDF document
      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  getExcelReprot: async (req, res) => {
    try {
      const startdate = new Date(req.query.startingdate);
      const Endingdate = new Date(req.query.endingdate);
      Endingdate.setDate(Endingdate.getDate() + 1);
  
      const orderCursor = await Order.aggregate([
        {
          $match: {
            orderdate: { $gte: startdate, $lte: Endingdate }
          }
        }
      ]);
      console.log(orderCursor)
  
      if (orderCursor.length === 0) {
        return res.redirect('/admin/salesreport');
      }
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
  
      // Add data to the worksheet
      worksheet.columns = [
        { header: 'Username', key: 'username', width: 15 },
        { header: 'Product Name', key: 'productname', width: 20 },
        { header: 'Quantity', key: 'quantity', width: 15 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Order Date', key: 'orderdate', width: 18 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'City', key: 'city', width: 20 },      // Add City column
        { header: 'Pincode', key: 'pincode', width: 15 }, // Add Pincode column
        { header: 'Phone', key: 'phone', width: 15 }      // Add Phone column
      ];
  
      for (const orderItem of orderCursor) {
        const addressDetails = await Address.findById(orderItem.addressid);
      for (const product  of orderItem.products) {
        if (product.status === "Delivered") {
          worksheet.addRow({
            'username': orderItem.user,
            'productname': product.product,
            'quantity': product.quantity,
            'price': product.price,
            'status': product.status,
            'orderdate': orderItem.orderdate,
            'address': addressDetails ? addressDetails.address : 'N/A',
            'city': addressDetails ? addressDetails.city : 'N/A',
            'pincode': addressDetails ? addressDetails.pincode : 'N/A',
            'phone': addressDetails ? addressDetails.phone : 'N/A'
          });
        }
      }
    }
  
      // Generate the Excel file and send it as a response
      workbook.xlsx.writeBuffer().then((buffer) => {
        const excelBuffer = Buffer.from(buffer);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=excel.xlsx');
        res.send(excelBuffer);
      });
    } catch (error) {
      console.error('Error creating or sending Excel file:', error);
      res.status(500).send('Internal Server Error');
    }
  },





  getLogin: (req, res) => {
    try {
      console.log("reached login route for admin")
      if (req.session.admin) {
        //Redirect to dashboard if authenticated
        res.redirect("/admin/dashboard");
      } else {
        res.render("admin/login", { message: null });
      }
    } catch (err) {
      console.error("Error in getLogout:", err);
      res.status(500).send("Error occurred during login. Please try again.");
    }
  },

  postLogin: (req, res) => {
   
    const { username, password } = req.body;
    const admin = {
      username: "susin",
      password: "admin",
    };

    if (username === admin.username && password === admin.password) {
      req.session.admin = admin.username;
      console.log('this is the admin name', req.session.admin)
      console.log('this is the user id ', req.session.userId)

      res.redirect("/admin/dashboard");
    } else {
      res.render("admin/login", { message: "login failed! try again" });
    }
  },

  getLogout: (req, res) => {
    try {
      console.log('reached inside the get logout of ADMIN side')
      console.log('user session ', req.session.userId)
      console.log('admin session id ', req.session.admin)
      req.session.destroy((err) => {
        if (err) {
          console.log("Error destroying session: ", err);
        } else {
          res.redirect("/admin/login");
        }
      });
    } catch (err) {
      console.error("Error in getLogout:", err);
      res.status(500).send("Error occurred during logout. Please try again.");
    }
  },



  getAdminDashboard: async (req, res) => {
    try {
  
      const dailyOrders = await Order.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderdate" } },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
  
  
      const { dates, orderCounts, totalOrderCount } = dailyOrders.reduce(
        (result, order) => {
          result.dates.push(order._id);
          result.orderCounts.push(order.orderCount);
          result.totalOrderCount += order.orderCount;
          return result;
        },
        { dates: [], orderCounts: [], totalOrderCount: 0 }
      );
      console.log('count daily', dates, "", dailyOrders);
  
  
  
  
      const monthlyOrders = await Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$orderdate" },
              month: { $month: "$orderdate" },
            },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);
      console.log(monthlyOrders)
  
      // Extract only the order counts
      const orderCount = monthlyOrders.map(order => order.orderCount);
      
      const monthlyData = monthlyOrders.reduce((result, order) => {
        const monthYearString = `${order._id.year}-${String(order._id.month).padStart(2, '0')}`;
        result.push({
          month: monthYearString,
          orderCount: order.orderCount,
        });
        return result;
      }, [])
      let monthdata = orderCount

      const yearlyOrders = await Order.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y", date: "$orderdate" } },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
  
      const { years, orderCounts3, totalOrderCount3 } = yearlyOrders.reduce(
        (result, order) => {
          result.years.push(order._id);
          result.orderCounts3.push(order.orderCount);
          result.totalOrderCount3 += order.orderCount;
          return result;
        },
        { years: [], orderCounts3: [], totalOrderCount3: 0 }
      );
      console.log(dailyOrders, orderCounts, monthdata, totalOrderCount3)
      res.render('admin/dashboard', { dailyOrders, dates, orderCounts, monthdata, totalOrderCount3 });
  
    } catch (error) {
      console.error('Error fetching and aggregating orders:', error);
      res.status(500).send('Internal Server Error');
    }
  },

  getUserManagement: async (req, res) => {
    try {
      const users = await User.find();
      res.render("admin/userManagement", { users });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch user data. Please try again.");
    }
  },

  getBlockUser: async (req, res) => {
    try {
      console.log("reached toggler")

      const user = await User.findOne({ _id: req.params.id });
      console.log(user)
      user.isBlocked = !user.isBlocked;
      user.save();
      res.redirect("/admin/usermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to block user.");
    }
  },

  getCategoryManagement: async (req, res) => {
    try {
      const categories = await Category.find();
      res.render("admin/categoryManagement", { categories });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch categories. Please try again.");
    }
  },
   getOfferManagement: async (req, res) => {
    try {
      const offers = await Offer.find();
      res.render("admin/offermanagement", { offers });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch offers. Please try again.");
    }
  },
  getBannerManagement: async (req, res) => {
    try {
      const banners = await Banner.find();
      res.render("admin/bannermanagement", { banners });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch offers. Please try again.");
    }
  },
  getBanner: async (req, res) => {
    try {
      res.render("admin/addbanner");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get addbanner page.");
    }
  },
  postBanner: async (req, res) => {
    const newBanner = new Banner({
      image: req.file.path.substring(6),
    })
    newBanner.save()
    res.redirect("/admin/bannermanagement");
  },
  getDeleteCategory: async (req, res) => {
    try {
      const categoryId = req.params.id;
      await Category.findByIdAndDelete(categoryId);
      res.redirect("/admin/categorymanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete coupon.");
    }
  },
  getDeleteBanner: async (req, res) => {
    try {
      const bannerId = req.params.id;
      await Banner.findByIdAndDelete(bannerId);
      res.redirect("/admin/bannermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete banner");
    }
  },

  getOffer: async (req, res) => {
    try {
      const products = await Product.find()
      const categories = await Category.find()
      res.render("admin/addoffer", { categories, products });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get addoffer page.");
    }
  },
  getCouponManagement: async (req, res) => {
    try {
      const coupons = await Coupon.find();
      res.render("admin/coupenmanagement", { coupons });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch coupons. Please try again.");
    }
  },
  getCoupon: async (req, res) => {
    try {
      res.render("admin/addcoupen");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get addcoupon page.");
    }
  },
  getDeleteCategory: async (req, res) => {
    try {
      const categoryId = req.params.id;
      await Category.findByIdAndDelete(categoryId);
      res.redirect("/admin/categorymanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete coupon.");
    }
  },
  getDeleteCoupon: async (req, res) => {
    try {
      const couponId = req.params.id;
      await Coupon.findByIdAndDelete(couponId);
      res.redirect("/admin/couponmanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete coupon");
    }
  },
  getEditCoupon: async (req, res) => {
    try {
      const id = req.params.id;
      const coupon = await Coupon.findOne({ _id: id });
      res.render("admin/editcoupon", { coupon: coupon });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to display the coupon edit page.");
    }
  },
  postEditCoupen: async (req, res) => {
    const id = req.params.id;
    const { coupencode, discount, expiryDate, limit } = req.body;
    try {
      await Coupon.updateOne(
        { _id: id },
        { $set: { code: coupencode, discount: discount, expiryDate: expiryDate, limit: limit } }
      );
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to edit coupen.");
    }
    res.redirect("/admin/couponmanagement");
  },
  getEditCoupon: async (req, res) => {
    try {
      const id = req.params.id;
      const coupon = await Coupon.findOne({ _id: id });
      res.render("admin/editcoupon", { coupon: coupon });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to display the coupon edit page.");
    }
  },
  postEditCoupen: async (req, res) => {
    const id = req.params.id;
    const { coupencode, discount, expiryDate, limit } = req.body;
    try {
      await Coupon.updateOne(
        { _id: id },
        { $set: { code: coupencode, discount: discount, expiryDate: expiryDate, limit: limit } }
      );
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to edit coupen.");
    }
    res.redirect("/admin/couponmanagement");
  },
  postCoupen: async (req, res) => {
    const { coupencode, discount, expiryDate, limit } = req.body;
    const isthere = await Coupon.findOne({ code: coupencode });
    if (isthere === null) {
      try {
        const newCoupen = new Coupon({
          code: coupencode,
          discount: discount,
          expiryDate: expiryDate,
          limit: limit,
        });
        newCoupen.save();
      } catch (err) {
        console.error(err);
        return res.status(500).send("Error inserting coupon");
      }
      res.redirect("/admin/couponmanagement");
    } else {
      res.render("admin/addcategory", { message: "Category already exist!" });
    }
  },
  getDeleteImage: async (req, res) => {
    try {
      const id = req.body.productid;
      const index = req.body.index;
      const product = await Product.findById(id);
      product.image.splice(index, 1)
      await product.save()
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to display the coupon edit page.");
    }
  },








  getDeleteOffer: async (req, res) => {
    try {
      const offerId = req.params.id;
      await Offer.findByIdAndDelete(offerId);
      res.redirect("/admin/offermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete offer");
    }
  },
  postOffer: async (req, res) => {
    const { product, category, discount, expiryDate } = req.body;
    const isthere = await Offer.findOne({ $or: [ { applicableProduct: product }, { applicableCategorie: category } ] });
    if (isthere === null) {
      try {
        const newOffer = new Offer({
          applicableProduct: product,
          applicableCategorie: category,
          discount: discount,
          expiryDate: expiryDate,
          isActive: true,

        });
        newOffer.save();
      } catch (err) {
        console.error(err);
        return res.status(500).send("Error inserting offer");
      }
      res.redirect("/admin/offermanagement");
    } else {
      const products = await Product.find()
      const categories = await Category.find()
      res.render("admin/addoffer", { message: "Offer already exist!", products, categories });
    }
  },







  getAddCategory: async (req, res) => {
    try {
      res.render("admin/addCategory",{placeholder:null});
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get category edit page.");
    }
  },

  postAddCategory: async (req, res) => {
    const newCategoryName = req.body.newcategoryname.trim().toLowerCase();

    try {
        // Check if the category already exists
        const checkingForSameCategoryInDB = await Category.findOne({ category: newCategoryName });

        if(newCategoryName === '') {
          return res.render("admin/addCategory", { placeholder: "Please enter a category name : )", message: "Please enter a category name" });

        }else if (checkingForSameCategoryInDB) {
            return res.render("admin/addCategory", { placeholder: "Please use another name : )", message: "Category name already exists, please choose another name" });
        } else {
            // Save the new category
            const newCategory = await Category.create({ category: newCategoryName });
            console.log("New category saved:", newCategory);
        }

        res.redirect("/admin/categorymanagement");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Failed to add category.");
    }
},



  getDeleteCategory: async (req, res) => {
    try {
      const categoryId = req.params.id;
      await Category.findByIdAndDelete(categoryId);
      await Product.deleteMany({ category: categoryId });
      res.redirect("/admin/categorymanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete coupon.");
    }
  },



  getEditCategory: async (req, res) => {
    try {
      const id = req.params.id;
      const { category, _id } = await Category.findOne({ _id: id });


      res.render("admin/editCategory", { category, id,placeholder:null });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to display the category edit page.");
    }
  },


  postEditCategory: async (req, res) => {
    const id = req.params.id;
    

    const newcategoryname = req.body.newcategoryname.trim().toLowerCase();
    
    const gettingTheCategoryWithId = await Category.findOne({_id:id});
    const ifUserEnteredTheSameCategoryNameAgain = gettingTheCategoryWithId.category === newcategoryname


    const checkingForSameCategoryInDB = await Category.findOne({ category: newcategoryname })

    try {
      if(newcategoryname === '') {
        return res.render("admin/editCategory", {placeholder:"Please enter a category name : )", category:null,id:id, message: "Please enter a category name" })

      } else if(ifUserEnteredTheSameCategoryNameAgain){
        return res.render("admin/editCategory", {placeholder:"Same Name...!", category:null,id:id, message: "You have entered the same name again please go back if you don't want to change the name" })

      }else if   (checkingForSameCategoryInDB) {
      return  res.render("admin/editCategory", {placeholder:"Please use another name : )", category:null,id:id, message: "Category name already exists please choose another name" })
      } else {

       

        await Category.updateOne(
          { _id: id },
          { $set: { category: newcategoryname } }
        );

      }
      
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to edit category.");
    }
    res.redirect("/admin/categorymanagement");
  },
};
