const express = require('express');
const router = express.Router();
const Sales = require('../model/Sales');
const Stock = require('../model/Stock');
const { isSalesperson, isAuthenticated } = require('../middleware/auth');

// Get new sale page with products
router.get('/newsale', isAuthenticated, async (req, res) => {
  try {
    const products = await Stock.find({ quantity: { $gt: 0 } });
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
router.post('/sales', isAuthenticated, async (req, res) => {
    try {
        const { 
          customerName, 
          customerPhone, 
          ninNumber,
          productId, 
          quantity, 
          unitprice, 
          transportFee, 
          totalamount, 
          amountPaid, 
          change, 
          paymentMethod,
          isDepositCustomer,
          distance
        } = req.body;
        
        // PHONE VALIDATION - Ugandan format (+256 or 0)
        const phoneRegex = /^(\+256|0)[0-9]{9}$/;
        if (!phoneRegex.test(customerPhone)) {
          const products = await Stock.find({ quantity: { $gt: 0 } });
          return res.render('newsale', {
            products: products,
            error: 'Invalid phone number. Must start with +256 or 0 followed by 9 digits'
          });
        }
        
        // Find product from Stock collection
        const product = await Stock.findById(productId);
        
        if (!product) {
          const products = await Stock.find({ quantity: { $gt: 0 } });
          return res.render('newsale', {
            products: products,
            error: 'Product not found'
          });
        }
        
        // Check stock availability
        if (product.quantity < parseInt(quantity)) {
          const products = await Stock.find({ quantity: { $gt: 0 } });
          return res.render('newsale', {
            products: products,
            error: `Insufficient stock. Only ${product.quantity} units available.`
          });
        }
        
        // TRANSPORT CALCULATION WITH DISTANCE CONDITION
        let finalTransportFee = parseFloat(transportFee) || 0;
        const totalBeforeTransport = parseFloat(unitprice) * parseInt(quantity);
        const distanceValue = parseFloat(distance) || 0;
        
        // Apply business rule: free delivery if within 10km AND total >= 500,000
        if (distanceValue <= 10 && totalBeforeTransport >= 500000) {
          finalTransportFee = 0;
        } else {
          finalTransportFee = 30000;
        }
        
        // Calculate totals
        const total = totalBeforeTransport + finalTransportFee;
        
        // NIN validation for deposit scheme customers
        if (isDepositCustomer === 'yes' && (!ninNumber || ninNumber.trim() === '')) {
          const products = await Stock.find({ quantity: { $gt: 0 } });
          return res.render('newsale', {
            products: products,
            error: 'NIN number is required for deposit scheme customers'
          });
        }
        
        // Create sale record
        let newSale = new Sales({
            customerName,
            customerPhone,
            ninNumber: ninNumber || null,
            productId,
            productName: product.productName,
            productCategory: product.category,
            quantity,
            unitprice,
            distance: distanceValue,
            transportFee: finalTransportFee,
            totalamount: total,
            amountPaid,
            change,
            paymentMethod,
            isDepositCustomer: isDepositCustomer || 'no',
            salesperson: req.user ? req.user._id : null
        });
        
        await newSale.save();
        
        // FIXED: Update product stock (using correct field name 'quantity')
        product.quantity = product.quantity - parseInt(quantity);
        await product.save();
        
        console.log(`Stock updated: ${product.productName} - New quantity: ${product.quantity}`);
        
        res.redirect(`/receipt/${newSale._id}`);
        
    } catch (error) {
        console.error(error);
        const products = await Stock.find({ quantity: { $gt: 0 } });
        res.render('newsale', {
          products: products,
          error: 'Failed to add sale: ' + error.message
        });
    }
});

// GET - Check stock page
router.get('/check-stock', isAuthenticated, async (req, res) => {
  try {
    const stocks = await Stock.find({}, 'productName productType quantity sellingPrice')
      .sort({ productName: 1 });
    
    res.render('check-stock', { stocks: stocks });
  } catch (error) {
    console.error(error);
    res.render('check-stock', { stocks: [], error: 'Failed to load stock' });
  }
});

// GET - Receipt page
router.get('/receipt/:id', async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id).populate('salesperson', 'fullname');
    
    if (!sale) {
      return res.redirect('/newsale?error=Receipt not found');
    }
    
    const salespersonName = sale.salesperson ? sale.salesperson.fullname : 'Unknown';
    
    res.render('receipt', { sale: sale, salespersonName: salespersonName });
  } catch (error) {
    console.error(error);
    res.redirect('/newsale?error=Unable to load receipt');
  }
});

// GET - View all sales (simple list with populate)
router.get('/sales-list', isAuthenticated, async (req, res) => {
  try {
    const sales = await Sales.find()
      .populate('salesperson', 'fullname')
      .sort({ createdAt: -1 });
    
    res.render('sales-list', { sales: sales });
  } catch (error) {
    console.error(error);
    res.render('sales-list', { sales: [] });
  }
});

// GET - Edit sale form
router.get('/sale/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id);
    if (!sale) {
      return res.redirect('/sales-list?error=Sale not found');
    }
    res.render('sale-edit', { sale: sale });
  } catch (error) {
    res.redirect('/sales-list?error=Unable to load sale');
  }
});

// POST - Update sale
router.post('/sale/update/:id', isAuthenticated, async (req, res) => {
  try {
    await Sales.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/sales-list?success=Sale updated');
  } catch (error) {
    res.redirect('/sales-list?error=Update failed');
  }
});

// POST - Delete sale
router.post('/sale/delete/:id', isAuthenticated, async (req, res) => {
  try {
    await Sales.findByIdAndDelete(req.params.id);
    res.redirect('/sales-list?success=Sale deleted');
  } catch (error) {
    res.redirect('/sales-list?error=Delete failed');
  }
});

module.exports = router;