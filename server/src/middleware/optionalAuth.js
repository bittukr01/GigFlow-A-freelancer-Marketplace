const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
    return next();
  } catch (err) {
    return next();
  }
};

module.exports = optionalAuth;
