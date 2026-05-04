const express = require("express");
const router = express.Router();
const Inventory = require("../model/Inventory");

//get the inventory page
router.get("/inventorymgt", (req,res)=>{
    res.render("inventory")
})

//inventory post route
router.post("/inventorymgt", async(req,res)=>{
    try {
        const {productname, category, price, quantity}= req.body;
        const newProduct= new Inventory({
            productname,
            category,
            price,
            quantity
        });
        await newProduct.save();
        res.redirect("/inventorymgt");
    } catch (error) {
        console.error(error);
        res.render('inventory', {error: 'Failed to add product'});
    }
})



module.exports = router;