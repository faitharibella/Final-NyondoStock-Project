const express = require("express");
const router = express.Router();
const Registration = require('../model/Registration');
const { isAdmin, isSalesperson, isManager } = require('../middleware/auth');
const Stock = require("../model/Stock");
const Sales = require("../model/Sales");

// Get admin dashboard 
router.get("/admin", isAdmin, async (req, res) => {
  try {
    // Fetch users from Registration collection
    const users = await Registration.find({}).limit(5).sort({ createdAt: -1 });
    const userCount = await Registration.countDocuments();

    res.render("admindash", { 
      users: users,
      userCount: userCount,
      user: req.user
    });
  } catch (error) {
    console.error(error);
    res.render("admindash", { 
      users: [],
      userCount: 0,
      user: req.user
    });
  }
});

// Get salesperson dashboard 
router.get("/salesperson", isSalesperson, (req, res) => {
  res.render("sales-persondash");
});

// Get manager dashboard 
router.get('/manager', isManager, async (req, res) => {
  try {
    // Total products count
    const totalProducts = await Stock.countDocuments();

    // Total available stock (sum of all quantities)
    const totalStockResult = await Stock.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const totalStock = totalStockResult[0] ? totalStockResult[0].total : 0;

    // Low stock count (quantity less than 10)
    const lowStockCount = await Stock.countDocuments({ quantity: { $lt: 10 } });

    // Low stock products list
    const lowStockProducts = await Stock.find({ quantity: { $lt: 10 } }).limit(5);

    // Recent products (first 5, newest first)
    const recentProducts = await Stock.find({}).limit(5).sort({ createdAt: -1 });

    // Today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySalesList = await Sales.find({ 
      createdAt: { $gte: today } 
    }).populate('salesperson', 'fullname');

    // Today's sales total
    const todaySales = todaySalesList.reduce((sum, sale) => sum + sale.totalamount, 0);

    // Format today's sales for display
    const formattedSales = todaySalesList.map(sale => ({
      productName: sale.productName,
      quantity: sale.quantity,
      totalamount: sale.totalamount,
      createdAt: sale.createdAt,
      salespersonName: sale.salesperson ? sale.salesperson.fullname : 'Unknown'
    }));

    res.render('managerdash', {
      totalProducts: totalProducts,
      totalStock: totalStock,
      lowStockCount: lowStockCount,
      lowStockProducts: lowStockProducts,
      recentProducts: recentProducts,
      todaySales: todaySales,
      todaySalesList: formattedSales
    });
  } catch (error) {
    console.error(error);
    res.render('managerdash', {
      totalProducts: 0,
      totalStock: 0,
      lowStockCount: 0,
      lowStockProducts: [],
      recentProducts: [],
      todaySales: 0,
      todaySalesList: []
    });
  }
});

module.exports = router;