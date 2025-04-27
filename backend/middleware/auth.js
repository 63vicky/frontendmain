const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // Fallback to cookie if no Authorization header
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Find user in database using id from token
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      req.token = token;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Convert both the user role and allowed roles to lowercase for case-insensitive comparison
    const userRole = String(req.user.role).toLowerCase();
    const allowedRoles = roles.map(role => String(role).toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Access denied',
        userRole: userRole,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize }; 