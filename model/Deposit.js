const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
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
    required: true,
    trim: true
  },
  totalDeposited: {
    type: Number,
    required: true,
    default: 0
  },
  amountUsed: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'closed'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Deposit', depositSchema);