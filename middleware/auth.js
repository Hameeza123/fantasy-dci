const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Middleware to check if user owns resource or is admin
const requireOwnership = (field = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[field] || req.body[field];
    
    if (req.user.isAdmin || req.user._id.toString() === resourceUserId) {
      return next();
    }
    
    res.status(403).json({ message: 'Access denied' });
  };
};

// Middleware to check if user is league member
const requireLeagueMembership = async (req, res, next) => {
  try {
    const leagueId = req.params.leagueId || req.body.leagueId;
    const League = require('../models/League');
    
    const league = await League.findById(leagueId);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    if (!league.isMember(req.user._id)) {
      return res.status(403).json({ message: 'League membership required' });
    }
    
    req.league = league;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check if user is league commissioner
const requireCommissioner = async (req, res, next) => {
  try {
    const leagueId = req.params.leagueId || req.body.leagueId;
    const League = require('../models/League');
    
    const league = await League.findById(leagueId);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    if (!league.isCommissioner(req.user._id)) {
      return res.status(403).json({ message: 'Commissioner access required' });
    }
    
    req.league = league;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnership,
  requireLeagueMembership,
  requireCommissioner
}; 