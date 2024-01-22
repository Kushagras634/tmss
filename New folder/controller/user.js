const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
       // const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
};

const loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(500).json({ message: "User doesn't exist" });
        }
        console.log(req.body.password);
        console.log(user.password)
        const isMatched = await bcrypt.compare(req.body.password, user.password);

        if (isMatched) {
            jwt.sign({ user }, "jeevesh", { expiresIn: '10h' }, (err, token) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to generate token' });
                } else {
                    return res.status(200).json({ token, message: "Login successful" });
                }
            });

        } else {
            return res.status(500).json({ message: "Invalid password" });
        }

    } catch (e) {
        console.error(e);
        res.status(401).send({ error: 'Invalid login credentials' });
    }
};


const logoutUser = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.send('Logged out successfully');
    } catch (e) {
        res.status(500).send(e);
    }
};

const logoutAllUsers = async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send('Logged out from all devices successfully');
    } catch (e) {
        res.status(500).send(e);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (e) {
        res.status(500).send(e);
    }
};

const getUserById = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.status(200).send(user);
    } catch (e) {
        res.status(400).send(e);
    }
};

module.exports = { createUser, loginUser, logoutUser, logoutAllUsers, getAllUsers, getUserById };
