const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route to register a new user
router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;
    try{
        const existingUser = await User.findOne({$or: { username, email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        const newUser = new User({ username, email });
        newUser.setPassword(password);
        await newUser.save();
    
        res.status(201).json({ message: 'User created successfully' });
    }
     catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});