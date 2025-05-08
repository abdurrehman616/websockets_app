// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : authHeader;

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user and attach to the request
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Attach user info to request

    // Check if the user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, admin only' });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Provide Authorization Token in Header' });
  }
};
