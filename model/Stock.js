const mongoose = require('mongoose');

const stockschema = new mongoose.Schema({
  productName: {
    type: String
  },
quantity: {
    type: Number
  },
  unitCost: {
    type: Number
  },
  sellingPrice: {
    type: Number
  },
  supplierName: {
    type: String
  },
  supplierPhone: {
    type: Number,
    required: true,
    match: /^\+256[0-9]{9}$/
  },
  factoryName: {
    type: String
  },
  paymentStatus: {
    type: String,
    required: true,
  },
    date: {
    type: Date,
    default: Date.now
  },
  total: {
    type: Number,
  }
});

module.exports = mongoose.model('Stock',stockschema)