const express = require("express");
const router = express.Router();
const Product = require("../model/Product");

// GET - Display products page (with products from database)
router.get("/products", async (req, res) => {
  try {
    // Get all products from database
    const products = await Product.find({}).sort({ createdAt: -1 });
    
    // Render page with products
    res.render("products", { 
      products: products,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error(error);
    res.render("products", { 
      products: [],
      error: "Failed to load products" 
    });
  }
});

// POST - Add new product to database
router.post('/products', async (req, res) => {
  try {
    const { productname, category, price, quantity } = req.body;
    
    const newProduct = await Product.create({
      productname,
      category,
      price,
      quantity
    });
    
    // Redirect with success message
    res.redirect('/products?success=Product added successfully');
    
  } catch (error) {
    console.error(error);
    res.redirect('/products?error=' + error.message);
  }
});

// POST - Delete product
router.post('/products/delete', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.body.id);
    res.redirect('/products?success=Product deleted successfully');
  } catch (error) {
    res.redirect('/products?error=' + error.message);
  }
});

// GET - Search products
router.get('/products/search', async (req, res) => {
  try {
    const search = req.query.search;
    const products = await Product.find({ 
      productname: { $regex: search, $options: 'i' } 
    });
    res.render('products', { 
      products: products, 
      searchTerm: search,
      success: null,
      error: null
    });
  } catch (error) {
    res.redirect('/products?error=' + error.message);
  }
});

module.exports = router;