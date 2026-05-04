const express = require('express');
const Registration = require('../model/Registration');  // Changed from User
const router = express.Router();

// Get users page - fetch from Registration collection
router.get('/users', async (req, res) => {
    try {
        const users = await Registration.find({});
        res.render('users', { users: users });
    } catch (error) {
        console.log(error);
        res.render('users', { users: [] });
    }
});

// Add new user - NO passport, just direct save
router.post('/users', async (req, res) => {
    try {
        const { fullname, email, role, status, password } = req.body;
        
        // Check if user already exists
        let existingUser = await Registration.findOne({
            email: email.toLowerCase(),
        });
        if (existingUser) {
            const users = await Registration.find({});
            return res.render("users", {
                users: users,
                error: "User Already Exists"
            });
        }
        
        // Create new user using Registration model with register method
        const newUser = new Registration({
            fullname,
            email: email.toLowerCase(),
            role: role || 'Salesperson'
        });
        
        // Use register method from passport (Registration model has passport plugin)
        await Registration.register(newUser, password);
        
        console.log('New user created:', newUser);
        res.redirect('/users?success=User added successfully');
    } catch (error) {
        console.log(error);
        res.redirect('/users?error=' + error.message);
    }
});

// Delete user
router.post('/users/delete', async (req, res) => {
    try {
        await Registration.findByIdAndDelete(req.body.id);
        res.redirect('/users?success=User deleted');
    } catch (error) {
        console.log(error);
        res.redirect('/users?error=Delete failed');
    }
});

// Search users
router.get('/users/search', async (req, res) => {
    try {
        const search = req.query.search;
        const users = await Registration.find({
            $or: [
                { fullname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        });
        res.render('users', { users: users, searchTerm: search });
    } catch (error) {
        console.log(error);
        res.redirect('/users?error=Search failed');
    }
});

// Edit user
router.post('/users/edit', async (req, res) => {
    try {
        const { id, fullname, email, role, status } = req.body;
        
        // Update user (status field might not exist in Registration schema - check)
        await Registration.findByIdAndUpdate(id, { 
            fullname, 
            email: email.toLowerCase(), 
            role 
        });
        res.redirect('/users?success=User updated');
    } catch (error) {
        console.log(error);
        res.redirect('/users?error=Update failed');
    }
});

module.exports = router;