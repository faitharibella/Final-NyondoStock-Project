const express = require("express");
const router = express.Router();
const Registration = require("../model/Registration");
const passport = require("passport");

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
router.get('/logout', (req, res, next) => {
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
    const { fullname, email, role, password } = req.body;
    
    // Check if user already exists
    let existingUser = await Registration.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return res.render("registration", {
        error: "Email is already registered",
      });
    }
    
    // Create new user with status = 'active'
    const newUser = new Registration({
      fullname,
      email: email.toLowerCase(),
      role,
      status: 'active'  // ✅ ADD THIS - default to active
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

module.exports = router;