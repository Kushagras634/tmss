const express = require('express');
const router = express.Router();
const authMiddleware = require('../authenticate/authMIddleware');
const user = require('../controller/user');

// Create a new user
router.post('/', user.createUser);

// Login user
router.post('/login', user.loginUser);

// Logout user
router.post('/logout', authMiddleware, user.logoutUser);

// Logout user from all devices
router.post('/logoutAll', authMiddleware, user.logoutAllUsers);

// Get all users
router.get('/', user.getAllUsers);

// Get user by ID
router.get('/:id', user.getUserById);

module.exports = router;
