const express = require('express');
const Draft = require('../models/Draft');
const League = require('../models/League');
const Corps = require('../models/Corps');
const Team = require('../models/Team');
const { draftValidation, paramValidation } = require('../middleware/validation');
const { authenticateToken, requireLeagueMembership, requireCommissioner } = require('../middleware/auth');

const router = express.Router();

// Get draft by league ID
router.get('/league/:leagueId', authenticateToken, requireLeagueMembership, paramValidation.leagueId, async (req, res) => {
  try {
    const draft = await Draft.findOne({ league: req.params.leagueId })
      .populate('league')
      .populate('currentUser', 'username firstName lastName')
      .populate('draftOrder.user', 'username firstName lastName')
      .populate('picks.user', 'username firstName lastName')
      .populate('picks.corps', 'name abbreviation');
    
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    res.json({ draft });
  } catch (error) {
    console.error('Get draft error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create draft (commissioner only)
router.post('/league/:leagueId', authenticateToken, requireCommissioner, paramValidation.leagueId, draftValidation.start, async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    // Check if draft already exists
    const existingDraft = await Draft.findOne({ league: req.params.leagueId });
    if (existingDraft) {
      return res.status(400).json({ message: 'Draft already exists for this league' });
    }
    
    // Check if league has enough members
    if (league.members.length < 2) {
      return res.status(400).json({ message: 'League must have at least 2 members to start draft' });
    }
    
    const { timeLimit, autoPick } = req.body;
    
    const draft = new Draft({
      league: req.params.leagueId,
      settings: {
        timeLimit: timeLimit || 60,
        autoPick: autoPick !== undefined ? autoPick : true,
        sections: league.settings.sections
      }
    });
    
    // Generate draft order
    draft.generateDraftOrder();
    
    await draft.save();
    
    // Populate data
    await draft.populate('league');
    await draft.populate('draftOrder.user', 'username firstName lastName');
    
    res.status(201).json({
      message: 'Draft created successfully',
      draft
    });
  } catch (error) {
    console.error('Create draft error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start draft (commissioner only)
router.post('/:draftId/start', authenticateToken, requireCommissioner, paramValidation.draftId, async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.draftId);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    if (draft.status !== 'pending') {
      return res.status(400).json({ message: 'Draft is not in pending status' });
    }
    
    draft.status = 'active';
    draft.startedAt = new Date();
    draft.currentUser = draft.getCurrentPicker()?.user;
    
    await draft.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`draft-${draft._id}`).emit('draft-started', {
      draftId: draft._id,
      currentUser: draft.currentUser,
      status: draft.status
    });
    
    res.json({
      message: 'Draft started successfully',
      draft
    });
  } catch (error) {
    console.error('Start draft error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Make a pick
router.post('/:draftId/pick', authenticateToken, requireLeagueMembership, paramValidation.draftId, draftValidation.makePick, async (req, res) => {
  try {
    const { corpsId, section } = req.body;
    
    const draft = await Draft.findById(req.params.draftId);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    if (draft.status !== 'active') {
      return res.status(400).json({ message: 'Draft is not active' });
    }
    
    // Verify corps exists
    const corps = await Corps.findById(corpsId);
    if (!corps) {
      return res.status(404).json({ message: 'Corps not found' });
    }
    
    try {
      const pick = draft.makePick(req.user._id, corpsId, section);
      await draft.save();
      
      // Add corps to user's team
      const team = await Team.findOne({ user: req.user._id, league: draft.league });
      if (team) {
        team.addCorps(corpsId, section, pick.round, pick.pick);
        await team.save();
      }
      
      // Populate pick data
      await draft.populate('picks.user', 'username firstName lastName');
      await draft.populate('picks.corps', 'name abbreviation');
      await draft.populate('currentUser', 'username firstName lastName');
      
      // Emit real-time update
      const io = req.app.get('io');
      io.to(`draft-${draft._id}`).emit('pick-made', {
        draftId: draft._id,
        pick: draft.picks[draft.picks.length - 1],
        currentUser: draft.currentUser,
        status: draft.status
      });
      
      res.json({
        message: 'Pick made successfully',
        pick: draft.picks[draft.picks.length - 1],
        draft
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } catch (error) {
    console.error('Make pick error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Auto-pick
router.post('/:draftId/auto-pick', authenticateToken, requireLeagueMembership, paramValidation.draftId, async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.draftId);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    if (draft.status !== 'active') {
      return res.status(400).json({ message: 'Draft is not active' });
    }
    
    try {
      const pick = draft.autoPick(req.user._id);
      await draft.save();
      
      // Emit real-time update
      const io = req.app.get('io');
      io.to(`draft-${draft._id}`).emit('auto-pick-made', {
        draftId: draft._id,
        pick,
        currentUser: draft.currentUser,
        status: draft.status
      });
      
      res.json({
        message: 'Auto-pick made successfully',
        pick,
        draft
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } catch (error) {
    console.error('Auto-pick error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available corps for section
router.get('/:draftId/available/:section', authenticateToken, requireLeagueMembership, paramValidation.draftId, async (req, res) => {
  try {
    const { section } = req.params;
    
    if (!['brass', 'percussion', 'guard', 'visual', 'generalEffect'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }
    
    const draft = await Draft.findById(req.params.draftId);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    // Get drafted corps for this section
    const draftedCorpsIds = draft.picks
      .filter(pick => pick.section === section)
      .map(pick => pick.corps.toString());
    
    // Get available corps
    const availableCorps = await Corps.find({
      _id: { $nin: draftedCorpsIds },
      isActive: true
    })
    .sort({ [`sections.${section}.score`]: -1 })
    .select(`name abbreviation sections.${section} totalScore`);
    
    res.json({ availableCorps });
  } catch (error) {
    console.error('Get available corps error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get draft board
router.get('/:draftId/board', authenticateToken, requireLeagueMembership, paramValidation.draftId, async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.draftId)
      .populate('picks.user', 'username firstName lastName')
      .populate('picks.corps', 'name abbreviation')
      .populate('draftOrder.user', 'username firstName lastName');
    
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    // Organize picks by round
    const draftBoard = [];
    const totalRounds = draft.getTotalRounds();
    
    for (let round = 1; round <= totalRounds; round++) {
      const roundPicks = draft.picks.filter(pick => pick.round === round);
      draftBoard.push({
        round,
        picks: roundPicks
      });
    }
    
    res.json({
      draftBoard,
      currentRound: draft.currentRound,
      currentPick: draft.currentPick,
      status: draft.status
    });
  } catch (error) {
    console.error('Get draft board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pause draft (commissioner only)
router.post('/:draftId/pause', authenticateToken, requireCommissioner, paramValidation.draftId, async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.draftId);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    if (draft.status !== 'active') {
      return res.status(400).json({ message: 'Draft is not active' });
    }
    
    draft.status = 'pending';
    await draft.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`draft-${draft._id}`).emit('draft-paused', {
      draftId: draft._id,
      status: draft.status
    });
    
    res.json({
      message: 'Draft paused successfully',
      draft
    });
  } catch (error) {
    console.error('Pause draft error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel draft (commissioner only)
router.post('/:draftId/cancel', authenticateToken, requireCommissioner, paramValidation.draftId, async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.draftId);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    draft.status = 'cancelled';
    await draft.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`draft-${draft._id}`).emit('draft-cancelled', {
      draftId: draft._id,
      status: draft.status
    });
    
    res.json({
      message: 'Draft cancelled successfully',
      draft
    });
  } catch (error) {
    console.error('Cancel draft error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 