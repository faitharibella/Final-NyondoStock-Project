const express = require('express');
const router = express.Router();
const Sales = require('../model/Sales');
const Stock = require('../model/Stock');
const Deposit = require('../model/Deposit');
const Registration = require('../model/Registration');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Helper function to get date range based on period
function getDateRange(period) {
  const now = new Date();
  let startDate;
  
  switch(period) {
    case 'daily':
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = null;
  }
  
  return startDate;
}

// GET - Reports page
router.get('/reports', isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const period = req.query.period || 'all';
    const startDate = getDateRange(period);
    
    // Build query for sales
    let salesQuery = {};
    if (startDate) {
      salesQuery.createdAt = { $gte: startDate };
    }
    
    // Build query for stock (restock history)
    let stockQuery = {};
    if (startDate) {
      stockQuery.date = { $gte: startDate };
    }
    
    // SALES DATA
    const allSales = await Sales.find(salesQuery);
    const totalSales = allSales.reduce((sum, sale) => sum + sale.totalamount, 0);
    const totalItems = allSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalTransactions = allSales.length;
    const avgSale = totalTransactions > 0 ? Math.floor(totalSales / totalTransactions) : 0;
    
    // Top Selling Products using aggregation
    const topProducts = await Sales.aggregate([
      { $match: salesQuery },
      { $group: {
          _id: '$productName',
          totalSold: { $sum: '$quantity' },
          revenue: { $sum: '$totalamount' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $project: {
          productName: '$_id',
          totalSold: 1,
          revenue: 1,
          _id: 0
        }
      }
    ]);
    
    // STOCK DATA
    const stockItems = await Stock.find({});
    const totalProducts = stockItems.length;
    const totalUnits = stockItems.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockCount = stockItems.filter(item => item.quantity < 10).length;
    
    // RESTOCK HISTORY
    const restockHistory = await Stock.find(stockQuery)
      .sort({ date: -1 })
      .limit(20);
    
    // FINANCIAL DATA (Admin only)
    let supplierDebt = 0;
    let totalDeposits = 0;
    let totalRevenue = totalSales;
    
    if (user.role === 'Admin') {
      const creditStock = await Stock.find({ paymentStatus: 'credit' });
      supplierDebt = creditStock.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
      
      const deposits = await Deposit.find({});
      totalDeposits = deposits.reduce((sum, dep) => sum + dep.balance, 0);
    }
    
    // USER PERFORMANCE (Admin only)
    let userPerformance = [];
    if (user.role === 'Admin') {
      const users = await Registration.find({ role: 'Salesperson' });
      
      for (const userRecord of users) {
        const userSales = await Sales.find({ salesperson: userRecord._id });
        const totalUserSales = userSales.reduce((sum, sale) => sum + sale.totalamount, 0);
        const totalUserItems = userSales.reduce((sum, sale) => sum + sale.quantity, 0);
        
        userPerformance.push({
          fullname: userRecord.fullname,
          totalSales: totalUserSales,
          totalItems: totalUserItems,
          commission: totalUserSales * 0.05
        });
      }
    }
    
    res.render('reports', {
      user: user,
      totalSales: totalSales.toLocaleString(),
      totalItems: totalItems,
      totalTransactions: totalTransactions,
      avgSale: avgSale.toLocaleString(),
      topProducts: topProducts,
      stockItems: stockItems,
      totalProducts: totalProducts,
      totalUnits: totalUnits,
      lowStockCount: lowStockCount,
      restockHistory: restockHistory,
      totalRevenue: totalRevenue.toLocaleString(),
      supplierDebt: supplierDebt.toLocaleString(),
      totalDeposits: totalDeposits.toLocaleString(),
      userPerformance: userPerformance
    });
  } catch (error) {
    console.error(error);
    res.render('reports', {
      user: req.user,
      totalSales: 0,
      totalItems: 0,
      totalTransactions: 0,
      avgSale: 0,
      topProducts: [],
      stockItems: [],
      totalProducts: 0,
      totalUnits: 0,
      lowStockCount: 0,
      restockHistory: [],
      totalRevenue: 0,
      supplierDebt: 0,
      totalDeposits: 0,
      userPerformance: []
    });
  }
});

module.exports = router;