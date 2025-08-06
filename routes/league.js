const express = require('express');
const League = require('../models/League');
const User = require('../models/User');
const { leagueValidation, paramValidation, queryValidation } = require('../middleware/validation');
const { authenticateToken, requireLeagueMembership, requireCommissioner } = require('../middleware/auth');

const router = express.Router();

// Get all public leagues
router.get('/public', queryValidation.pagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { isPrivate: false };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const leagues = await League.find(query)
      .populate('commissioner', 'username firstName lastName')
      .populate('members.user', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await League.countDocuments(query);
    
    res.json({
      leagues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get public leagues error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's leagues
router.get('/my-leagues', authenticateToken, async (req, res) => {
  try {
    const leagues = await League.find({
      'members.user': req.user._id
    })
    .populate('commissioner', 'username firstName lastName')
    .populate('members.user', 'username firstName lastName')
    .sort({ updatedAt: -1 })
    .select('-__v');
    
    res.json({ leagues });
  } catch (error) {
    console.error('Get my leagues error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get league by ID
router.get('/:leagueId', paramValidation.leagueId, async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId)
      .populate('commissioner', 'username firstName lastName')
      .populate('members.user', 'username firstName lastName');
    
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    // Check if user is member (for private leagues)
    if (league.isPrivate && req.user && !league.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ league });
  } catch (error) {
    console.error('Get league error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new league
router.post('/', authenticateToken, leagueValidation.create, async (req, res) => {
  try {
    const { name, description, settings } = req.body;
    
    const league = new League({
      name,
      description,
      commissioner: req.user._id,
      settings: settings || {},
      members: [{ user: req.user._id, role: 'commissioner' }]
    });
    
    // Generate invite code
    league.generateInviteCode();
    
    await league.save();
    
    // Populate user data
    await league.populate('commissioner', 'username firstName lastName');
    await league.populate('members.user', 'username firstName lastName');
    
    res.status(201).json({
      message: 'League created successfully',
      league
    });
  } catch (error) {
    console.error('Create league error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update league (commissioner only)
router.put('/:leagueId', authenticateToken, requireCommissioner, async (req, res) => {
  try {
    const { name, description, settings, status, draftResults } = req.body;
    
    const league = await League.findById(req.params.leagueId);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    // Update fields
    if (name) league.name = name;
    if (description !== undefined) league.description = description;
    if (settings && Object.keys(settings).length > 0) league.settings = { ...league.settings, ...settings };
    if (status) league.status = status;
    if (draftResults !== undefined) {
      league.draftResults = draftResults;
    }
    
    await league.save();
    
    await league.populate('commissioner', 'username firstName lastName');
    await league.populate('members.user', 'username firstName lastName');
    
    res.json({
      message: 'League updated successfully',
      league
    });
  } catch (error) {
    console.error('Update league error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join league with invite code
router.post('/join', authenticateToken, leagueValidation.join, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    const league = await League.findOne({ inviteCode });
    if (!league) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }
    
    if (league.status !== 'setup') {
      return res.status(400).json({ message: 'League is no longer accepting members' });
    }
    
    try {
      league.addMember(req.user._id);
      await league.save();
      
      await league.populate('commissioner', 'username firstName lastName');
      await league.populate('members.user', 'username firstName lastName');
      
      res.json({
        message: 'Joined league successfully',
        league
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } catch (error) {
    console.error('Join league error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join league directly by ID (for public leagues)
router.post('/:leagueId/join', authenticateToken, async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    // Check if league is public and accepting members
    if (league.isPrivate) {
      return res.status(403).json({ message: 'This is a private league. You need an invite code.' });
    }
    
    if (league.status !== 'setup') {
      return res.status(400).json({ message: 'League is no longer accepting members' });
    }
    
    // Check if user is already a member
    if (league.isMember(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this league' });
    }
    
    // Add user to league
    league.addMember(req.user._id);
    await league.save();
    
    await league.populate('commissioner', 'username firstName lastName');
    await league.populate('members.user', 'username firstName lastName');
    
    res.json({
      message: 'Joined league successfully',
      league
    });
  } catch (error) {
    console.error('Join league error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave league
router.post('/:leagueId/leave', authenticateToken, requireLeagueMembership, async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    // Check if user is commissioner
    if (league.isCommissioner(req.user._id)) {
      return res.status(400).json({ 
        message: 'Commissioner cannot leave league. Transfer ownership first.' 
      });
    }
    
    league.removeMember(req.user._id);
    await league.save();
    
    res.json({ message: 'Left league successfully' });
  } catch (error) {
    console.error('Leave league error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member (commissioner only)
router.delete('/:leagueId/members/:userId', authenticateToken, requireCommissioner, paramValidation.userId, async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    const memberToRemove = req.params.userId;
    
    // Check if trying to remove commissioner
    if (league.isCommissioner(memberToRemove)) {
      return res.status(400).json({ message: 'Cannot remove commissioner' });
    }
    
    league.removeMember(memberToRemove);
    await league.save();
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Transfer commissioner role
router.post('/:leagueId/transfer-commissioner', authenticateToken, requireCommissioner, async (req, res) => {
  try {
    const { newCommissionerId } = req.body;
    
    if (!newCommissionerId) {
      return res.status(400).json({ message: 'New commissioner ID required' });
    }
    
    const league = await League.findById(req.params.leagueId);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    // Check if new commissioner is a member
    if (!league.isMember(newCommissionerId)) {
      return res.status(400).json({ message: 'New commissioner must be a league member' });
    }
    
    // Update commissioner
    league.commissioner = newCommissionerId;
    
    // Update member roles
    league.members.forEach(member => {
      if (member.user.toString() === req.user._id.toString()) {
        member.role = 'member';
      } else if (member.user.toString() === newCommissionerId) {
        member.role = 'commissioner';
      }
    });
    
    await league.save();
    
    await league.populate('commissioner', 'username firstName lastName');
    await league.populate('members.user', 'username firstName lastName');
    
    res.json({
      message: 'Commissioner transferred successfully',
      league
    });
  } catch (error) {
    console.error('Transfer commissioner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate new invite code (commissioner only)
router.post('/:leagueId/invite-code', authenticateToken, requireCommissioner, async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    const newInviteCode = league.generateInviteCode();
    await league.save();
    
    res.json({
      message: 'New invite code generated',
      inviteCode: newInviteCode
    });
  } catch (error) {
    console.error('Generate invite code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete league (commissioner only)
router.delete('/:leagueId', authenticateToken, requireCommissioner, async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    if (league.status !== 'setup') {
      return res.status(400).json({ message: 'Cannot delete active league' });
    }
    
    await League.findByIdAndDelete(req.params.leagueId);
    
    res.json({ message: 'League deleted successfully' });
  } catch (error) {
    console.error('Delete league error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 