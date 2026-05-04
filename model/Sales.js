const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
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
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
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
  transportFee: {
    type: Number,
    required: true,
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
    trim: true
  }
});

module.exports = mongoose.model('Sales', salesSchema);