const express = require('express');
const router = express.Router();
const Stock = require('../model/Stock');

// Show add stock form
router.get('/add_stock', (req, res) => {
  res.render('stockReg');   
});

// Add stock to the database
router.post('/add_stock', async (req, res) => {
  try {
    //  Removed 'total' from destructuring - backend will calculate it
    const { productName, quantity, unitCost, sellingPrice, supplierName, supplierPhone, factoryName, paymentStatus } = req.body;
    
    // Validation 1: Selling price must be greater than unit cost
    if (parseFloat(sellingPrice) <= parseFloat(unitCost)) {
      return res.render('stockReg', {
        error: `Selling price (UGX ${sellingPrice}) must be greater than unit cost (UGX ${unitCost})`
      });
    }

    // Validation 2: Ugandan phone number (+256 format)
    const ugandanPhoneRegex = /^\+256[0-9]{9}$/;
    if (!ugandanPhoneRegex.test(supplierPhone)) {
      return res.render('stockReg', {
        error: 'Invalid phone number. Must start with +256 followed by 9 digits (e.g., +256712345678)'
      });
    }

    // Calculate totalcost
    const total = parseInt(quantity) * parseFloat(unitCost);

    const newProduct = new Stock({
      productName,
      quantity,
      unitCost,
      sellingPrice,
      supplierName,
      supplierPhone,
      factoryName,
      paymentStatus,
      total
    });
    
    await newProduct.save();
    res.redirect('/stock');
    
  } catch (error) {
    console.error(error);
    res.render('stockReg', { error: error.message });
  }
});

module.exports = router;