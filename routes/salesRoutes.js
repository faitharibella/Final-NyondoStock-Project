const express = require('express');
const router = express.Router();
const Sales = require('../model/Sales');
const Stock = require('../model/Stock');
const Deposit = require('../model/Deposit');
const { isAuthenticated } = require('../middleware/auth');

// Get new sale page with products
router.get('/newsale', isAuthenticated, async (req, res) => {
  try {
    const products = await Stock.find({ quantity: { $gt: 0 } });
    res.render('newsale', { 
      products: products,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
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
      distance, 
      amountPaid, 
      paymentMethod,
      isDepositCustomer
    } = req.body;
    
    // Phone validation - Ugandan format
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
    
    // Get unit price from product
    const unitprice = product.sellingPrice;
    
    // Calculate subtotal
    const subtotal = unitprice * parseInt(quantity);
    
    // Calculate transport based on business rule
    const distanceValue = parseFloat(distance) || 0;
    let transportFee = 30000;
    if (distanceValue <= 10 && subtotal >= 500000) {
      transportFee = 0;
    }
    
    // Calculate total
    const total = subtotal + transportFee;
    
    // Calculate change
    let amountPaidValue = parseFloat(amountPaid) || 0;
    let finalChange = amountPaidValue - total;
    finalChange = finalChange >= 0 ? finalChange : 0;
    
    // NIN validation for deposit scheme customers
    if (isDepositCustomer === 'yes' && (!ninNumber || ninNumber.trim() === '')) {
      const products = await Stock.find({ quantity: { $gt: 0 } });
      return res.render('newsale', {
        products: products,
        error: 'NIN number is required for deposit scheme customers'
      });
    }
    
    // DEPOSIT SCHEME DEDUCTION LOGIC
    if (isDepositCustomer === 'yes') {
      // Find customer's deposit record by phone or NIN
      const deposit = await Deposit.findOne({ 
        $or: [
          { customerPhone: customerPhone },
          { ninNumber: ninNumber }
        ]
      });
      
      if (!deposit) {
        const products = await Stock.find({ quantity: { $gt: 0 } });
        return res.render('newsale', {
          products: products,
          error: 'No deposit account found for this customer. Please register them first.'
        });
      }
      
      if (deposit.balance < total) {
        const products = await Stock.find({ quantity: { $gt: 0 } });
        return res.render('newsale', {
          products: products,
          error: `Insufficient deposit balance. Available: UGX ${deposit.balance.toLocaleString()}`
        });
      }
      
      // Deduct from deposit balance
      deposit.amountUsed = (deposit.amountUsed || 0) + total;
      deposit.balance = deposit.totalDeposited - deposit.amountUsed;
      if (deposit.balance <= 0) {
        deposit.status = 'completed';
      }
      await deposit.save();
      
      // Set amount paid to total (no cash payment needed)
      amountPaidValue = total;
      finalChange = 0;
    }
    
    // Create sale record
    let newSale = new Sales({
      customerName,
      customerPhone,
      ninNumber: ninNumber || null,
      productId,
      productName: product.productName,
      productCategory: product.category,
      quantity: parseInt(quantity),
      unitprice: unitprice,
      distance: distanceValue,
      transportFee: transportFee,
      totalamount: total,
      amountPaid: amountPaidValue,
      change: finalChange,
      paymentMethod,
      isDepositCustomer: isDepositCustomer || 'no',
      salesperson: req.user ? req.user._id : null
    });
    
    await newSale.save();
    
    // Update product stock
    product.quantity = product.quantity - parseInt(quantity);
    await product.save();
    
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

// GET - Check stock page (shows total quantity per product)
router.get('/check-stock', isAuthenticated, async (req, res) => {
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
    
    res.render('check-stock', { stocks: stockSummary });
  } catch (error) {
    console.error(error);
    res.render('check-stock', { stocks: [] });
  }
});

// GET - Receipt page
router.get('/receipt/:id', isAuthenticated, async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id).populate('salesperson', 'fullname');
    if (!sale) {
      return res.redirect('/newsale?error=Receipt not found');
    }
    const salespersonName = sale.salesperson ? sale.salesperson.fullname : 'Unknown';
    res.render('receipt', { sale: sale, salespersonName: salespersonName });
  } catch (error) {
    res.redirect('/newsale?error=Unable to load receipt');
  }
});

// GET - Sales history page (for logged in salesperson)
router.get('/sales-history', isAuthenticated, async (req, res) => {
  try {
    const sales = await Sales.find({ salesperson: req.user._id })
      .sort({ createdAt: -1 });
    res.render('sales-history', { sales: sales });
  } catch (error) {
    res.render('sales-history', { sales: [] });
  }
});

module.exports = router;