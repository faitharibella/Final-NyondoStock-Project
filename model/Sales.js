const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  ninNumber: {
    type: String,
    trim: true
  },
  
  // Product Information
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Stock'
  },
  productName: {
    type: String,
    required: true
  },
  productCategory: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitprice: {
    type: Number,
    required: true
  },
  
  distance: {
    type: Number,
    default: 0
  },
  transportFee: {
    type: Number,
    default: 0
  },
  totalamount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  change: {
    type: Number,
    default: 0
  },
  
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Mobile Money', 'Bank Transfer', 'Credit'],
    required: true
  },
  isDepositCustomer: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  
  salesperson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sale', saleSchema);