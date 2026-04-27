const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  fullname: {
    type: String
  },
  email: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    trim: true
  },
    role: {
    type: String,
    trim: true,
  }
});

module.exports = mongoose.model('Registration', registrationSchema);