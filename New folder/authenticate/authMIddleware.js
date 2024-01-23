const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        //console.log(token);
        const decoded = jwt.verify(token, "jeevesh");
        //console.log(decoded.user);
        const user = await User.findOne({ email: decoded.user.email});   
        //console.log("user", user)
        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        console.log(e)
        res.status(401).send({ error: 'Please authenticate' });
    }
};

module.exports = authMiddleware;
