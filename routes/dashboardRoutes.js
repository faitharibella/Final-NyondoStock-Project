const express = require("express");
const router = express.Router();
const Registration = require('../model/Registration')

//Get admin dashboard
router.get("/admin", async (req, res) => {
  try {
    // Fetch users from Registration collection
    const users = await Registration.find({}).limit(5).sort({ createdAt: -1 });
    const userCount = await Registration.countDocuments();

    res.render("admindash", { 
      users: users,
      userCount: userCount,
      user: req.user
    });
  } catch (error) {
    console.error(error);
    res.render("admindash", { 
      users: [],
      userCount:0,
      user: req.user
    });
  }
});

//Get salespeerson dashboard
router.get("/salesperson", (req, res) => {
  res.render("sales-persondash");
}
);

//Get the managerdashboard
router.get('/manager',(req,res)=>{
  res.render('managerdash');
})







module.exports = router;