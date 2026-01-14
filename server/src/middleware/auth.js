const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // ✅ token cookie must exist
    const token = req.cookies && req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token' });
    }

    // ✅ verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ find user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // ✅ attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = auth;
