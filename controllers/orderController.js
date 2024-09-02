const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Wallet = require("../models/walletModel");
const PDFDocument = require('pdfkit');

module.exports = {
  getOrderManagement: async (req, res) => {
    try {
      const orders = await Order.find().sort({ orderdate: -1 });
      res.render("admin/ordermanagement", { orders });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch orders. Please try again.");
    }
  },

  postUpdateOrderstatus: async (req, res) => {
    try {
      const orderid = req.params.id;
      const productid = req.params.productid;
      await Order.updateOne({ _id: orderid, 'products.productid': productid }, { $set: { 'products.$.status': req.body.status } });
      res.redirect("/order/ordermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to update order status.");
    }
  },

  getUserCancelOrder: async (req, res) => {
    try {
      const userid = req.session.userId;
      const orderid = req.params.id;
      const order = await Order.findById(orderid);

      const productid = req.params.productid;
      await Order.updateOne({ _id: orderid, 'products.productid': productid }, { $set: { 'products.$.status': "Cancelled" } });
      const product = order.products.find(product => product.productid == productid);

      const refund = product.price * product.quantity - product.discount;
      if (
        order.paymentmethord == "Wallet" ||
        order.paymentmethord == "Razorpay"
      ) {
        await User.updateOne({ _id: userid }, { $inc: { wallet: refund } });
        const currentDate = new Date();
        const newWallet = new Wallet({
          userid: req.session.userId,
          date: currentDate,
          amount: refund,
          creditordebit: "credit",
        });
        newWallet.save();
      }
      await Product.updateOne({ _id: productid }, { $inc: { stock: product.quantity } });
      res.redirect("/orders");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to cancel order.");
    }
  },

  getUserReturnOrder: async (req, res) => {
    try {
      const userid = req.session.userId;
      const orderid = req.params.id;
      const order = await Order.findById(orderid);

      const productid = req.params.productid;
      await Order.updateOne({ _id: orderid, 'products.productid': productid }, { $set: { 'products.$.status': "Returned" } });
      const product = order.products.find(product => product.productid == productid);

      const refund = product.price * product.quantity - product.discount;
      if (
        order.paymentmethord == "Wallet" ||
        order.paymentmethord == "Razorpay"
      ) {
        await User.updateOne({ _id: userid }, { $inc: { wallet: refund } });
        const currentDate = new Date();
        const newWallet = new Wallet({
          userid: req.session.userId,
          date: currentDate,
          amount: refund,
          creditordebit: "credit",
        });
        newWallet.save();
      }
      res.redirect("/orders");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to return order.");
    }
  },

  getAdminCancelOrder: async (req, res) => {
    try {
      const userid = req.session.userId;
      const orderid = req.params.id;
      const order = await Order.findById(orderid)
      const productid = req.params.productid;
      await Order.updateOne({ _id: orderid, 'products.productid': productid }, { $set: { 'products.$.status': "Cancelled" } });
      const product = order.products.find(product => product.productid == productid);

      const refund = product.price * product.quantity - product.discount;

      if (
        order.paymentmethord == "Wallet" ||
        order.paymentmethord == "Razorpay"
      ) {
        await User.updateOne({ _id: userid }, { $inc: { wallet: refund } });
        const currentDate = new Date();
        const newWallet = new Wallet({
          userid: req.session.userId,
          date: currentDate,
          amount: refund,
          creditordebit: "credit",
        });
        newWallet.save();
      }
      res.redirect("/order/ordermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to cancel order by admin.");
    }
  },

  getOrderDetails: async (req, res) => {
    try {
      const userid = req.session.userId;
      const orderid = req.params.id;
      const productid = req.params.productid;
      const order = await Order.findById(orderid)
      res.render("user/orderdetails", { order, productid });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch orders. Please try again.");
    }
  },

  getAdminOrderDetails: async (req, res) => {
    try {
      const userid = req.session.userId;
      const orderid = req.params.id;
      const productid = req.params.productid;
      const order = await Order.findById(orderid)
      res.render("admin/orderdetails", { order, productid });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch orders. Please try again.");
    }
  },

  getInvoice: async (req, res) => {
    try {
      const userid = req.session.userId;
      const orderid = req.params.id;
      const productid = req.params.productid;
      const userDetial = await User.findById(userid)
      const order = await Order.findById(orderid)
      console.log(order)
      let productdata
      for(let product of order.products){
        if (productid == product.productid) {
          productdata = product;
          break;
      }
      }


      doc.text(productdata.product || "", 60, currentY, {
        width: 150,
        lineGap: 5,
    });

    doc.text(productdata.status || "", 220, currentY, {
        width: 50,
        lineGap: 5,
    });
 
    doc.text(productdata.quantity || "", 320, currentY, {
        width: 50,
        lineGap: 5,
    });
 

    doc.text(productdata.price || "", 370, currentY, {
        width: 50,
        lineGap: 5,
    });

    doc.text(productdata.discount || "0", 420, currentY, {
        width: 50,
        lineGap: 5,
    });

    // Calculate the height of the current row and add some padding
            const lineHeight = Math.max(
                doc.heightOfString(productdata.product || "", { width: 150 }),
                doc.heightOfString(productdata.status || "", { width: 150 }),
               
                doc.heightOfString(productdata.price || "", { width: 50 })
            );
            currentY += lineHeight + 10; // Adjust this value based on your layout
       
        doc.text(`Total Price: ${(productdata.price * productdata.quantity) - productdata.discount  || ""}`, {
            width: 400, // Adjust the width based on your layout
            lineGap: 5,
        });


        // Set the y-coordinate for the "Thank you" section
        const separation = 50; // Adjust this value based on your layout
        const thankYouStartY = currentY + separation; // Update this line

        // Move to the next section
        doc.y = thankYouStartY; // Change this line

        // Move the text content in the x-axis
        const textX = 60; // Adjust this value based on your layout
        const textWidth = 500; // Adjust this value based on your layout
        doc
            .fontSize(16)
            .text(
                "Thank you for choosing E-Cart! We appreciate your support and are excited to have you as part of our  family.",
                textX,
                doc.y,
                { align: "left", width: textWidth, lineGap: 10 }
            );

        doc.end();

    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch orders. Please try again.");
    }
  },

};
