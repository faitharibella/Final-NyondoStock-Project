const express = require('express');
const router = express.Router();
const Deposit = require('../model/Deposit');
const { isAdmin } = require('../middleware/auth');

// GET - Deposit page (view all deposits)
router.get('/deposit', isAdmin, async (req, res) => {
  try {
    const deposit = await Deposit.find({}).sort({ createdAt: -1 });
    res.render('deposit', { deposit: deposit, user: req.user });
  } catch (error) {
    console.error(error);
    res.render('deposit', { deposit: [], user: req.user });
  }
});

// POST - Add new deposit
router.post('/deposit/add', isAdmin, async (req, res) => {
  try {
    const { customerName, customerPhone, ninNumber, amount } = req.body;
    
    const newDeposit = new Deposit({
      customerName,
      customerPhone,
      ninNumber,
      totalDeposited: parseFloat(amount),
      balance: parseFloat(amount),
      createdBy: req.user._id
    });
    
    await newDeposit.save();
    res.redirect('/deposit?success=Deposit added successfully');
  } catch (error) {
    console.error(error);
    res.redirect('/deposit?error=' + error.message);
  }
});

// POST - Use deposit (deduct amount when customer takes goods)
router.post('/deposit/use', isAdmin, async (req, res) => {
  try {
    const { id, amount } = req.body;
    const deposit = await Deposit.findById(id);
    
    if (!deposit) {
      return res.redirect('/deposit?error=Deposit record not found');
    }
    
    const useAmount = parseFloat(amount);
    
    if (useAmount > deposit.balance) {
      return res.redirect('/deposit?error=Insufficient balance');
    }
    
    deposit.amountUsed += useAmount;
    deposit.balance -= useAmount;
    
    if (deposit.balance === 0) {
      deposit.status = 'completed';
    }
    
    await deposit.save();
    res.redirect('/deposit?success=Amount deducted successfully');
  } catch (error) {
    console.error(error);
    res.redirect('/deposit?error=' + error.message);
  }
});

// GET - Delete deposit
router.get('/deposit/delete/:id', isAdmin, async (req, res) => {
  try {
    await Deposit.findByIdAndDelete(req.params.id);
    res.redirect('/deposit?success=Deposit record deleted');
  } catch (error) {
    res.redirect('/deposit?error=Delete failed');
  }
});

module.exports = router;