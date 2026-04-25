const express = require('express');
const router = express.Router();

//Get index page


router.get('/login',(req,res)=>{
    res.render('login')
});

//get user-reg
router.get('/users',(req,res)=>{
    res.render('user-reg')
});

router.post('/users',(req,res)=>{
    console.log(req.body)
});

module.exports = router;