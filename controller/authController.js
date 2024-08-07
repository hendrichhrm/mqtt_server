//This code is Created by Hendrich H M
// You could adjust this code to your needs
// However, you can't remove the author's because it's against the law
// This code is Copyright of the author

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const { User } = require('../model/user');
require('dotenv').config();

const router = express.Router();

let lastLoggedInUser = ''; 
const generateToken = (user) => {
    return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Register attempt:', username);
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Username already taken:', username);
            return res.status(400).json({ message: 'Username already taken' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);
        const newUser = new User({ username, password: hashedPassword, isActive: false }); // Set isActive to false initially
        console.log('New user object:', newUser);
        await newUser.save();
        console.log('User registered:', username);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt:', username);
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid password for user:', username);
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = generateToken(user);
        lastLoggedInUser = username; // Set the last logged-in user

        // Update isActive status to true
        user.isActive = true;
        await user.save();

        console.log('User logged in:', username);
        res.status(200).json({ token, userId: user._id }); // Return user ID
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isActive = false;
        await user.save();
        console.log('User logged out:', user.username);
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

