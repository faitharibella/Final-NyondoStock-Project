const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose').default || require('passport-local-mongoose');


const registrationSchema = new mongoose.Schema({
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
    enum: ['active', 'inactive'],
    default: 'active'
  }
});

registrationSchema.plugin(passportLocalMongoose,{
  usernameField:"email"
});
module.exports = mongoose.model('Registration', registrationSchema);