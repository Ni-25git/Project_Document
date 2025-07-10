const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("token",authHeader)

  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  

  try {
    const decoded = jwt.verify(authHeader, JWT_SECRET);
    
    req.user = decoded; // attach decoded payload to request
    console.log('decoded',decoded)
    console.log('Authenticated user:', req.user);
    next();
  } catch (error) {
    // console.error('JWT error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;
