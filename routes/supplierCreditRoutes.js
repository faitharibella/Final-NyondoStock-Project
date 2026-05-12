const express = require('express');
const router = express.Router();
const SupplierCredit = require('../model/SupplierCredit');
const Stock = require('../model/Stock');
const { isAdmin } = require('../middleware/auth');

// GET - Supplier credit page
router.get('/supplier-credit', isAdmin, async (req, res) => {
  try {
    // Get all credit records from stock where paymentStatus is 'credit'
    const creditRecords = await Stock.find({ paymentStatus: 'credit' }).sort({ date: -1 });
    
    // Calculate totals
    let totalOwed = 0;
    let totalOverdue = 0;
    let uniqueSuppliers = new Set();
    
    creditRecords.forEach(record => {
      const amountOwed = record.unitCost * record.quantity;
      totalOwed += amountOwed;
      uniqueSuppliers.add(record.supplierName);
      
      // Check if overdue (30 days from date)
      const recordDate = new Date(record.date);
      const daysSince = Math.floor((new Date() - recordDate) / (1000 * 60 * 60 * 24));
      if (daysSince > 30 && record.paymentStatus === 'credit') {
        totalOverdue += amountOwed;
      }
    });
    
    res.render('supplierCredit', {
      credits: creditRecords,
      totalOwed: totalOwed.toLocaleString(),
      totalOverdue: totalOverdue.toLocaleString(),
      totalPaidThisMonth: 0,
      activeSuppliers: uniqueSuppliers.size
    });
  } catch (error) {
    console.error(error);
    res.render('supplierCredit', { credits: [] });
  }
});

// POST - Make payment on credit (simple version - just mark as paid)
router.post('/supplier-credit/pay', isAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    const credit = await Stock.findById(id);
    
    if (!credit) {
      return res.redirect('/supplier-credit?error=Credit record not found');
    }
    
    // Mark as paid
    credit.paymentStatus = 'cash';
    await credit.save();
    
    res.redirect('/supplier-credit?success=Payment recorded successfully');
  } catch (error) {
    console.error(error);
    res.redirect('/supplier-credit?error=' + error.message);
  }
});

module.exports = router;