const express = require("express");
const router = express.Router();
const Registration = require("../model/Registration");
const passport = require("passport");
const crypto = require('crypto');
const {isAuthenticated, isAdmin} = require('../middleware/auth');

//Get index page
router.get("/", (req, res) => {
  res.render("index");
});

router.post('/forms', (req, res) => {
  console.log(req.body);
});

// Get login page
router.get("/login", (req, res) => {
  res.render("login");
});

// Post login - WITH STATUS CHECK
router.post("/login", passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
  //  CHECK IF USER IS ACTIVE
  if (req.user.status && req.user.status !== 'active') {
    // Log them out immediately
    req.logout((err) => {
      if (err) return next(err);
      return res.render("login", { error: "Your account is inactive. Please contact admin." });
    });
    return;
  }
  
  // Redirect based on role
  if (req.user.role === 'Salesperson') {
    res.redirect('/salesperson');
  } else if (req.user.role === 'Admin') {
    res.redirect('/admin');
  } else if (req.user.role === 'Manager') {
    res.redirect('/manager');
  } else {
    res.redirect('/');
  }
});

// Logout route
router.get('/logout', isAuthenticated, (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Get register page
router.get("/registerform", (req, res) => {
  res.render("registration");
});

// Post register
router.post("/registerpost", async (req, res) => {
  try {
    const { fullname, email, phone, nin, role, password } = req.body;
    
    // Check if user already exists
    let existingUser = await Registration.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return res.render("registration", {
        error: "Email is already registered",
      });
    }
    
    // Validate phone number if provided
    const phoneRegex = /^\+256[0-9]{9}$/;
    if (phone && !phoneRegex.test(phone)) {
      return res.render("registration", {
        error: "Invalid phone number. Must start with +256 followed by 9 digits (e.g., +256712345678)"
      });
    }
    
    // Create new user with status = 'active'
    const newUser = new Registration({
      fullname,
      email: email.toLowerCase(),
      phone: phone || null,
      nin: nin || null,
      role,
      status: 'active'
    });
    
    console.log(newUser);
    
    await Registration.register(newUser, req.body.password, (err) => {
      if (err) {
        return res.redirect('/registerform');
      }
    });
    
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.render("registration", { error: error.message });
  }
});

//Get forgot password page
router.get('/forgot-password', async(req,res)=>{
  res.render('forgot-password');
});

//post -send reset link
router.post('/forgot-password', async (req,res)=>{
  try {
    const {email} = req.body;
    const user = await Registration.findOne({email: email.toLowerCase()});

    if(!user){
      return res.render('forgot-password', {error: 'No account found with that email address'});
    }

    //Creating a reset token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; //1hour
    await user.save();

    //In the real app, send email here. for now, show the link
    const resetLink = `${req.get('host')}/reset-password/${token}`;

    res.render('forgot-password', {
      success: `Password reset link has been generated. Use the link to reset your password: ${resetLink}`
    });
  } catch (error) {
    console.error(error);
    res.render('forgot-password', {error: 'Something went wrong.Please try again'});
  }
});

// GET - Reset password page
router.get('/reset-password/:token', async (req, res) => {
  try {
    const user = await Registration.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.redirect('/forgot-password?error=Password reset token is invalid or has expired');
    }
    
    res.render('reset-password', { token: req.params.token });
  } catch (error) {
    res.redirect('/forgot-password?error=Something went wrong');
  }
});

// POST - Reset password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    
    const user = await Registration.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.redirect('/forgot-password?error=Password reset token is invalid or has expired');
    }
    
    // Set new password
    user.setPassword(password, async (err) => {
      if (err) {
        return res.render('reset-password', { 
          token: req.params.token, 
          error: 'Password could not be set. Please try again.' 
        });
      }
      
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      
      res.redirect('/login?success=Password has been reset successfully. Please login with your new password.');
    });
  } catch (error) {
    res.render('reset-password', { 
      token: req.params.token, 
      error: 'Something went wrong. Please try again.' 
    });
  }
});

module.exports = router;