const express = require('express');
const router = express.Router();
const Sales = require('../model/Sales');
const Product = require('../model/Product');

// Get new sale page with products (ONLY ONE route)
router.get('/newsale', async (req, res) => {
  try {
    const products = await Product.find({});
    console.log('Products found:', products.length);
    res.render('newsale', { 
      products: products,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error(error);
    res.render('newsale', { 
      products: [],
      error: "Failed to load products"
    });
  }
});

// Add new sale
router.post('/sales', async (req, res) => {
    try {
        const {customerName, customerPhone, productId, quantity, unitprice, transportFee, totalamount, amountPaid, change, paymentMethod} = req.body;
        
        // Find product to get its name
        const product = await Product.findById(productId);
        
        const total = parseInt(quantity) * parseFloat(unitprice) + parseInt(transportFee);
        
        let newSale = new Sales({
            customerName,
            customerPhone,
            productId,
            productName: product ? product.productname : 'Unknown',
            quantity,
            unitprice,
            transportFee,
            totalamount: total,
            amountPaid,
            change,
            paymentMethod
        });
        
        await newSale.save();
        
        // Update product stock
        if (product) {
            product.quantity = product.quantity - parseInt(quantity);
            await product.save();
        }
        
        res.redirect('/newsale?success=Sale completed successfully');
    } catch (error) {
        console.error(error);
        res.render('newsale', {error: 'Failed to add sale'});
    }
});

module.exports = router;