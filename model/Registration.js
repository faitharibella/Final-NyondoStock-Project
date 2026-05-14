const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose').default || require('passport-local-mongoose');

const registrationSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  phone: {
    type: String,
    trim: true,
    match: /^\+256[0-9]{9}$/
  },
  nin: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    trim: true,
    enum: ['Salesperson', 'Admin', 'Manager'],
    default: 'Salesperson'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  resetPasswordToken: {
  type: String,
  default: null
},
resetPasswordExpires: {
  type: Date,
  default: null
}
});

registrationSchema.plugin(passportLocalMongoose, {
  usernameField: "email"
});

module.exports = mongoose.model('Registration', registrationSchema);