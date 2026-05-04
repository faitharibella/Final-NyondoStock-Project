const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  fullname: {
    type: String
  },
  email: {
    type: String,
    trim: true
  },
    role: {
    type: String,
    trim: true,
    enum:['Salesperson', 'Admin', 'Manager']
  },
    status: {
    type: String,
    trim: true
  },
});

module.exports = mongoose.model('User', userSchema);