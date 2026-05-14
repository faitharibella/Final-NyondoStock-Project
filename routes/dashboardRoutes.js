const express = require("express");
const router = express.Router();
const Registration = require("../model/Registration");
const { isAdmin, isSalesperson, isManager } = require("../middleware/auth");
const Stock = require("../model/Stock");
const Sales = require("../model/Sales");

// Get admin dashboard
router.get("/admin", isAdmin, async (req, res) => {
  try {
    // Fetch users from Registration collection
    const users = await Registration.find({}).limit(5).sort({ createdAt: -1 });
    const userCount = await Registration.countDocuments();

    // Recent sales (last 5)
    const recentSales = await Sales.find({}).sort({ createdAt: -1 }).limit(5);

    // Stock stats
    const stockCount = await Stock.countDocuments();
    const lowStockCount = await Stock.countDocuments({ quantity: { $lt: 10 } });

    // Sales stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySalesRecords = await Sales.find({ createdAt: { $gte: today } });
    const todaySales = todaySalesRecords.reduce(
      (sum, sale) => sum + sale.totalamount,
      0,
    );

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlySalesRecords = await Sales.find({
      createdAt: { $gte: startOfMonth },
    });
    const monthlyRevenue = monthlySalesRecords.reduce(
      (sum, sale) => sum + sale.totalamount,
      0,
    );

    // Supplier credit from stock where paymentStatus is 'credit'
    const creditRecords = await Stock.find({ paymentStatus: "credit" });
    const supplierDebt = creditRecords.reduce(
      (sum, record) => sum + record.unitCost * record.quantity,
      0,
    );

    res.render("admindash", {
      users: users,
      userCount: userCount,
      stockCount: stockCount,
      lowStockCount: lowStockCount,
      todaySales: todaySales,
      monthlyRevenue: monthlyRevenue,
      supplierDebt: supplierDebt,
      recentSales: recentSales,
      user: req.user,
    });
  } catch (error) {
    console.error(error);
    res.render("admindash", {
      users: [],
      userCount: 0,
      stockCount: 0,
      lowStockCount: 0,
      todaySales: 0,
      monthlyRevenue: 0,
      supplierDebt: 0,
      user: req.user,
      rescentSales: [],
    });
  }
});

// Get salesperson dashboard
router.get("/salesperson", isSalesperson, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total products count
    const totalProducts = await Stock.countDocuments();

    // Get today's sales for this salesperson
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySalesRecords = await Sales.find({
      salesperson: userId,
      createdAt: { $gte: today },
    });
    const todaySales = todaySalesRecords.reduce(
      (sum, sale) => sum + sale.totalamount,
      0,
    );

    // Get this month's sales for commission
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlySalesRecords = await Sales.find({
      salesperson: userId,
      createdAt: { $gte: startOfMonth },
    });
    const monthlySales = monthlySalesRecords.reduce(
      (sum, sale) => sum + sale.totalamount,
      0,
    );
    const commission = Math.floor(monthlySales * 0.05);

    // Get recent sales (last 5)
    const recentSales = await Sales.find({ salesperson: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.render("sales-persondash", {
      user: req.user,
      totalProducts: totalProducts,
      todaySales: todaySales.toLocaleString(),
      commission: commission.toLocaleString(),
      recentSales: recentSales,
    });
  } catch (error) {
    console.error(error);
    res.render("sales-persondash", {
      user: req.user,
      totalProducts: 0,
      todaySales: 0,
      commission: 0,
      recentSales: [],
    });
  }
});

// Get manager dashboard
router.get("/manager", isManager, async (req, res) => {
  try {
    // Total products count
    const totalProducts = await Stock.countDocuments();

    // Total available stock (sum of all quantities)
    const totalStockResult = await Stock.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    const totalStock = totalStockResult[0] ? totalStockResult[0].total : 0;

    // Low stock count (quantity less than 10)
    const lowStockCount = await Stock.countDocuments({ quantity: { $lt: 10 } });

    // Low stock products list
    const lowStockProducts = await Stock.find({ quantity: { $lt: 10 } }).limit(
      5,
    );

    // Recent products (first 5, newest first)
    const recentProducts = await Stock.find({})
      .limit(5)
      .sort({ createdAt: -1 });

    // Today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySalesList = await Sales.find({
      createdAt: { $gte: today },
    }).populate("salesperson", "fullname");

    // Today's sales total
    const todaySales = todaySalesList.reduce(
      (sum, sale) => sum + sale.totalamount,
      0,
    );

    // Format today's sales for display
    const formattedSales = todaySalesList.map((sale) => ({
      productName: sale.productName,
      quantity: sale.quantity,
      totalamount: sale.totalamount,
      createdAt: sale.createdAt,
      salespersonName: sale.salesperson ? sale.salesperson.fullname : "Unknown",
    }));

    res.render("managerdash", {
      totalProducts: totalProducts,
      totalStock: totalStock,
      lowStockCount: lowStockCount,
      lowStockProducts: lowStockProducts,
      recentProducts: recentProducts,
      todaySales: todaySales,
      todaySalesList: formattedSales,
    });
  } catch (error) {
    console.error(error);
    res.render("managerdash", {
      totalProducts: 0,
      totalStock: 0,
      lowStockCount: 0,
      lowStockProducts: [],
      recentProducts: [],
      todaySales: 0,
      todaySalesList: [],
    });
  }
});

module.exports = router;
