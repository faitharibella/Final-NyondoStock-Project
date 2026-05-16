const express = require('express');
const router = express.Router();
const Stock = require('../model/Stock');
const {isManager} = require('../middleware/auth');

// Show add stock form - also fetch existing records for tables
router.get('/add_stock', isManager, async (req, res) => {
  try {
    // Fetch stock records for the table
    const stockRecords = await Stock.find({}).sort({ date: -1 });
    
    // Get unique suppliers for supplier table (group by supplierName)
    const suppliers = await Stock.aggregate([
      {
        $group: {
          _id: '$supplierName',
          supplierPhone: { $first: '$supplierPhone' },
          factoryName: { $first: '$factoryName' },
          productsSupplied: { $addToSet: '$productName' },
          lastSupplyDate: { $max: '$date' },
          paymentStatus: { $first: '$paymentStatus' }
        }
      }
    ]);
    
    res.render('stockReg', { 
      stockRecords: stockRecords,
      suppliers: suppliers
    });
  } catch (error) {
    console.error(error);
    res.render('stockReg', { 
      stockRecords: [],
      suppliers: [],
      error: error.message 
    });
  }
});

// Add stock to the database
router.post('/add_stock', isManager, async (req, res) => {
  try {
    // Get form data - includes category and productType now
    const { category, productType, quantity, unitCost, sellingPrice, supplierName, supplierPhone, factoryName, paymentStatus } = req.body;
    
    // Create the full product name from category + productType
    const productName = `${category} - ${productType}`;
    
    // Validation 1: Selling price must be greater than unit cost
    if (parseFloat(sellingPrice) <= parseFloat(unitCost)) {
      const stockRecords = await Stock.find({}).sort({ date: -1 });
      const suppliers = await Stock.aggregate([
        { $group: { _id: '$supplierName', supplierPhone: { $first: '$supplierPhone' }, factoryName: { $first: '$factoryName' }, productsSupplied: { $addToSet: '$productName' }, lastSupplyDate: { $max: '$date' }, paymentStatus: { $first: '$paymentStatus' } } }
      ]);
      return res.render('stockReg', {
        stockRecords: stockRecords,
        suppliers: suppliers,
        error: `Selling price (UGX ${sellingPrice}) must be greater than unit cost (UGX ${unitCost})`
      });
    }
    
    // Validation 2: Phone number must start with +256
    const phoneRegex = /^\+256[0-9]{9}$/;
    if (!phoneRegex.test(supplierPhone)) {
      const stockRecords = await Stock.find({}).sort({ date: -1 });
      const suppliers = await Stock.aggregate([
        { $group: { _id: '$supplierName', supplierPhone: { $first: '$supplierPhone' }, factoryName: { $first: '$factoryName' }, productsSupplied: { $addToSet: '$productName' }, lastSupplyDate: { $max: '$date' }, paymentStatus: { $first: '$paymentStatus' } } }
      ]);
      return res.render('stockReg', {
        stockRecords: stockRecords,
        suppliers: suppliers,
        error: 'Invalid phone number. Must start with +256 followed by 9 digits (e.g., +256712345678)'
      });
    }

    // ALWAYS CREATE A NEW RECORD (keep history)
    const total = parseInt(quantity) * parseFloat(unitCost);
    
    const newProduct = new Stock({
      category,
      productType,
      productName,
      quantity: parseInt(quantity),
      unitCost: parseFloat(unitCost),
      sellingPrice: parseFloat(sellingPrice),
      supplierName,
      supplierPhone,
      factoryName,
      paymentStatus,
      total,
      date: new Date()
    });
    
    await newProduct.save();
    console.log('New stock entry added:', newProduct.productName);
    
    res.redirect('/add_stock?success=Stock added successfully');
    
  } catch (error) {
    console.error(error);
    const stockRecords = await Stock.find({}).sort({ date: -1 });
    const suppliers = await Stock.aggregate([
      { $group: { _id: '$supplierName', supplierPhone: { $first: '$supplierPhone' }, factoryName: { $first: '$factoryName' }, productsSupplied: { $addToSet: '$productName' }, lastSupplyDate: { $max: '$date' }, paymentStatus: { $first: '$paymentStatus' } } }
    ]);
    res.render('stockReg', {
      stockRecords: stockRecords,
      suppliers: suppliers,
      error: error.message
    });
  }
});

// GET - Current stock page (shows total quantity per product)
router.get('/current-stock', async (req, res) => {
  try {
    // Group by productName and sum quantities
    const stockSummary = await Stock.aggregate([
      {
        $group: {
          _id: '$productName',
          totalQuantity: { $sum: '$quantity' },
          sellingPrice: { $first: '$sellingPrice' }
        }
      },
      {
        $project: {
          productName: '$_id',
          totalQuantity: 1,
          sellingPrice: 1,
          _id: 0
        }
      },
      { $sort: { productName: 1 } }
    ]);
    
    res.render('current-stock', { stockSummary: stockSummary, user: req.user });
  } catch (error) {
    console.error(error);
    res.render('current-stock', { stockSummary: [], user: req.user });
  }
});

// DELETE - Delete stock record
router.get('/delete-stock/:id', isManager, async (req, res) => {
  try {
    await Stock.findByIdAndDelete(req.params.id);
    res.redirect('/add_stock?success=Stock record deleted successfully');
  } catch (error) {
    console.error(error);
    res.redirect('/add_stock?error=Failed to delete stock record');
  }
});

module.exports = router;