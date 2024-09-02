const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const path   = require('path');
const fs = require('fs'); 


module.exports = {


  getProductManagement: async (req, res) => {
    try {
      
      const products = await Product.find({}).populate("category");
     
      res.render("admin/productManagement", { products });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get products. please try again");
    }
  },
  getAddProduct: async (req, res) => {
    try {
      const categories = await Category.find();
      res.render("admin/addProduct", { categories,errorMessage:null,formData:null });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error getting addproduct page");
    }
  },


  postAddProduct: async (req, res) => {
    const { productname, category, price, description, Stock, isListed, croppedImages,ingredients} = req.body;
    console.log(ingredients,"this is ingredients")
    
  
    
  
    try {
      // Check if a product with the same name exists in the specified category
      const existingProduct = await Product.findOne({ 
        productname: productname, 
        category: category 
      });
  
      if (existingProduct) {
        // Render the form again with an error message
        const categories = await Category.find();
        return res.render("admin/addProduct", {
          categories,
          errorMessage: "Product name already exists in this category.",
          formData:req.body
        });
      }
  
      // Create a new product if no existing product is found
      const newProduct = new Product({
        productname: productname,
        category: category,
        price: price,
        description: description,
        image: croppedImages || [],
        stock: Stock,
        isListed: isListed,
        ingredients:ingredients
      });
  
      await newProduct.save(); // Save the new product to the database
      res.redirect("/admin/productmanagement");
    } catch (error) {
      console.error('Error saving product to database:', error);
      return res.status(500).send('Error saving product to database');
    }
  } 
  
,


  getEditProduct: async (req, res) => {
    try {
      const product = await Product.findOne({ _id: req.params.id }).populate(
        "category"
      );
      
    
  
      
     
      const categories = await Category.find().ne('_id',product.category._id);
      
     console.log('nothing')
      
      res.render("admin/editproduct", { product, categories,errorMessage:null});
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get product edit page.");
    }
  },

  postEditProduct: async (req, res) => {
    try {
      const id = req.params.id;
  
      // Handle file uploads
      const image = req.files.map((file) => file.path.substring(6));
  
      // Fetch the product by ID
      const product = await Product.findById(id);
  
      if (!product) {
        return res.status(404).send('Product not found');
      }
  
      // Extract fields from request body
      const { productname, category, price, description, stock, isListed,ingredients } = req.body;
      console.log(category)
  



      // Find the ObjectId for the given category name
      let categoryObjectId;
      if (category) {
        const categoryDoc = await Category.findOne({category: category });
        console.log('this is the category from req.body',category )
        console.log(categoryDoc)
        if (!categoryDoc) {
          return res.status(400).send('Invalid category');
        }
        categoryObjectId = categoryDoc._id;
      }
  
      // Check if the product name has changed
      if (productname !== product.productname) {
        // Verify if the new product name already exists in the specified category
        const existingProduct = await Product.findOne({ 
          productname: productname, 
          category: categoryObjectId || product.category
        });
  
        if (existingProduct) {
          // Render the edit form again with an error message and the existing data
          const categories = await Category.find();
          
          console.log(req.body.category)
          return res.render('admin/editproduct', {
            categories,
            product,
            formData: req.body,
            errorMessage: `Product name: ${productname} already exists in this category:  ${category}`
          });
        }
      }
  console.log(categoryObjectId)
      product.productname = productname;
      product.category = categoryObjectId // Use the ObjectId if found
      product.price = price;
      product.description = description;
      product.stock = stock;
      product.isListed = isListed;
      product.ingredients= ingredients
  
      // Update images if new ones are provided
      if (image.length > 0) {
        product.image.push(...image); // Add new images to the existing array
      }
  
      // Save the updated product
      await product.save();
  
      // Redirect to product management page
      res.redirect('/admin/productmanagement');
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).send('Server error');
    }
  },

  getUnlistProduct: async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id });
    try {
      product.isListed = !product.isListed;
      product.save();
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error changing product status");
    }
    res.redirect("/admin/productmanagement");
  },



  getDeleteImage: async (req, res) => {
    try {
      console.log("d")
      const { id } = req.params;
      const { index } = req.body;

      const product = await Product.findById(id);
      if (!product) {
          return res.status(404).json({ error: 'Product not found' });
      }
      if (index < 0 || index >= product.image.length) {
        return res.status(400).send("Invalid image index");
      }
      product.image.splice(index, 1);
      await product.save();
      // Remove the image URL from the product's image array
      // const imageIndex = product.image.indexOf(index);
      // if (imageIndex > -1) {
          
      // }

      res.status(200).json({ message: 'Image removed successfully' });
  } catch (error) {
      console.error('Error removing image:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
  },
};
