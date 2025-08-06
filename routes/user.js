const express = require('express');
const User = require('../models/User');
const Team = require('../models/Team');
const League = require('../models/League');
const { userValidation, paramValidation, queryValidation } = require('../middleware/validation');
const { authenticateToken, requireOwnership } = require('../middleware/auth');

const router = express.Router();

// Get user profile by ID
router.get('/:userId', paramValidation.userId, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -__v')
      .populate('leagues', 'name description status');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's teams
router.get('/:userId/teams', authenticateToken, requireOwnership('userId'), paramValidation.userId, async (req, res) => {
  try {
    const teams = await Team.find({ user: req.params.userId })
      .populate('league', 'name description status')
      .populate('roster.brass.corps', 'name abbreviation')
      .populate('roster.percussion.corps', 'name abbreviation')
      .populate('roster.guard.corps', 'name abbreviation')
      .populate('roster.visual.corps', 'name abbreviation')
      .populate('roster.generalEffect.corps', 'name abbreviation')
      .sort({ updatedAt: -1 });
    
    res.json({ teams });
  } catch (error) {
    console.error('Get user teams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's team for specific league
router.get('/:userId/teams/:leagueId', authenticateToken, requireOwnership('userId'), paramValidation.userId, paramValidation.leagueId, async (req, res) => {
  try {
    const team = await Team.findOne({ 
      user: req.params.userId, 
      league: req.params.leagueId 
    })
    .populate('league', 'name description status')
    .populate('roster.brass.corps', 'name abbreviation')
    .populate('roster.percussion.corps', 'name abbreviation')
    .populate('roster.guard.corps', 'name abbreviation')
    .populate('roster.visual.corps', 'name abbreviation')
    .populate('roster.generalEffect.corps', 'name abbreviation');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json({ team });
  } catch (error) {
    console.error('Get user team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create team for user
router.post('/:userId/teams', authenticateToken, requireOwnership('userId'), paramValidation.userId, async (req, res) => {
  try {
    const { name, leagueId } = req.body;
    
    if (!name || !leagueId) {
      return res.status(400).json({ message: 'Team name and league ID are required' });
    }
    
    // Check if user is member of the league
    const league = await League.findById(leagueId);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    if (!league.isMember(req.params.userId)) {
      return res.status(403).json({ message: 'User is not a member of this league' });
    }
    
    // Check if team already exists
    const existingTeam = await Team.findOne({ user: req.params.userId, league: leagueId });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team already exists for this league' });
    }
    
    const team = new Team({
      user: req.params.userId,
      league: leagueId,
      name,
      season: new Date().getFullYear()
    });
    
    await team.save();
    
    await team.populate('league', 'name description status');
    
    res.status(201).json({
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update team
router.put('/:userId/teams/:teamId', authenticateToken, requireOwnership('userId'), paramValidation.userId, paramValidation.teamId, async (req, res) => {
  try {
    const { name } = req.body;
    
    const team = await Team.findOne({ 
      _id: req.params.teamId, 
      user: req.params.userId 
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    if (name) {
      team.name = name;
    }
    
    await team.save();
    
    await team.populate('league', 'name description status');
    
    res.json({
      message: 'Team updated successfully',
      team
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Calculate team scores
router.post('/:userId/teams/:teamId/calculate-scores', authenticateToken, requireOwnership('userId'), paramValidation.userId, paramValidation.teamId, async (req, res) => {
  try {
    const team = await Team.findOne({ 
      _id: req.params.teamId, 
      user: req.params.userId 
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    await team.calculateScores();
    await team.save();
    
    res.json({
      message: 'Scores calculated successfully',
      scores: team.scores
    });
  } catch (error) {
    console.error('Calculate scores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's league standings
router.get('/:userId/standings', authenticateToken, requireOwnership('userId'), paramValidation.userId, async (req, res) => {
  try {
    const { leagueId } = req.query;
    
    if (!leagueId) {
      return res.status(400).json({ message: 'League ID is required' });
    }
    
    // Get all teams in the league
    const teams = await Team.find({ league: leagueId })
      .populate('user', 'username firstName lastName')
      .populate('league', 'name description');
    
    // Calculate scores for all teams
    for (const team of teams) {
      await team.calculateScores();
      await team.save();
    }
    
    // Sort by overall score
    teams.sort((a, b) => b.scores.overall.total - a.scores.overall.total);
    
    // Add rankings
    teams.forEach((team, index) => {
      team.rank = index + 1;
    });
    
    res.json({
      league: teams[0]?.league,
      standings: teams.map(team => ({
        rank: team.rank,
        user: team.user,
        teamName: team.name,
        scores: team.scores
      }))
    });
  } catch (error) {
    console.error('Get standings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/:userId/stats', authenticateToken, requireOwnership('userId'), paramValidation.userId, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's teams
    const teams = await Team.find({ user: req.params.userId })
      .populate('league', 'name');
    
    // Calculate statistics
    const stats = {
      totalLeagues: teams.length,
      totalCorps: 0,
      averageScore: 0,
      bestScore: 0,
      sections: {
        brass: { total: 0, average: 0, best: 0 },
        percussion: { total: 0, average: 0, best: 0 },
        guard: { total: 0, average: 0, best: 0 },
        visual: { total: 0, average: 0, best: 0 },
        generalEffect: { total: 0, average: 0, best: 0 }
      }
    };
    
    let totalScores = 0;
    let scoreCount = 0;
    
    for (const team of teams) {
      await team.calculateScores();
      
      // Count corps
      Object.keys(team.roster).forEach(section => {
        stats.totalCorps += team.roster[section].length;
      });
      
      // Track scores
      if (team.scores.overall.total > 0) {
        totalScores += team.scores.overall.total;
        scoreCount++;
        stats.bestScore = Math.max(stats.bestScore, team.scores.overall.total);
      }
      
      // Section scores
      Object.keys(team.scores).forEach(section => {
        if (section !== 'overall' && team.scores[section].total > 0) {
          stats.sections[section].total += team.scores[section].total;
          stats.sections[section].best = Math.max(stats.sections[section].best, team.scores[section].total);
        }
      });
    }
    
    if (scoreCount > 0) {
      stats.averageScore = totalScores / scoreCount;
    }
    
    // Calculate section averages
    Object.keys(stats.sections).forEach(section => {
      if (stats.sections[section].total > 0) {
        stats.sections[section].average = stats.sections[section].total / teams.length;
      }
    });
    
    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search', queryValidation.search, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }
    
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ]
    })
    .select('username firstName lastName avatar')
    .limit(10);
    
    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 