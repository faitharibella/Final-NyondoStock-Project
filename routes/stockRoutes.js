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

    // Check if product already exists
    let existingProduct = await Stock.findOne({ productName: productName });
    
    if (existingProduct) {
      // Update existing product - add to quantity
      existingProduct.quantity += parseInt(quantity);
      existingProduct.unitCost = parseFloat(unitCost);
      existingProduct.sellingPrice = parseFloat(sellingPrice);
      existingProduct.supplierName = supplierName;
      existingProduct.supplierPhone = supplierPhone;
      existingProduct.factoryName = factoryName || existingProduct.factoryName;
      existingProduct.paymentStatus = paymentStatus;
      existingProduct.total = existingProduct.quantity * existingProduct.unitCost;
      await existingProduct.save();
      console.log('Stock updated:', existingProduct.productName, 'New quantity:', existingProduct.quantity);
    } else {
      // Calculate total cost for new product
      const total = parseInt(quantity) * parseFloat(unitCost);
      
      // Create new stock record
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
        total
      });
      
      await newProduct.save();
      console.log('New stock added:', newProduct.productName);
    }
    
    // Redirect to refresh the page (GET will fetch updated data)
    res.redirect('/newsale?success=Sale completed');
    
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

//GET EDIT PAGE
router.get('/edit-price/:id', async(req,res)=>{
  const stock = await Stock.findById(req.params.id);
  res.render('edit-price', {stock: stock});
});

//the post route for editing
router.post('/update-price', async(req,res)=>{
  await Stock.findByIdAndUpdate(req.body.id, {sellingPrice: req.body.sellingPrice});
  res.redirect('/add_stock');
})


//delete button route
router.post('/delete-stock/:id', async(req,res)=>{
  try{
    await Stock.findByIdAndDelete(req.params.id);
    res.redirect('/add_stock?success=Stock record deleted successfully');
  }catch{
    console.error(error);
    res.redirect('/add_stock?error=Failed to delet stock record')
  }
});


module.exports = router;