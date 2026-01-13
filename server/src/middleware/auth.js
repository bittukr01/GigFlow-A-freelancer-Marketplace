const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      console.warn('Auth middleware: no token cookie present on request', { path: req.path, method: req.method, cookies: req.cookies });
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware: decoded token id =', decoded.id);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = auth;
