const express = require('express');
const router = express.Router();
const DCIDataParser = require('../utils/parseDciData');
const ScoreCalculator = require('../utils/scoreCalculator');
const { authenticateToken } = require('../middleware/auth');

const parser = new DCIDataParser();
const scoreCalculator = new ScoreCalculator();

// Get all scores
router.get('/', authenticateToken, async (req, res) => {
  try {
    const scores = parser.getAllScores();
    
    res.json({
      success: true,
      data: {
        scores: scores,
        totalScores: scores.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scores',
      error: error.message
    });
  }
});

// Get scores by corps
router.get('/corps/:corpsName', authenticateToken, async (req, res) => {
  try {
    const { corpsName } = req.params;
    const scores = parser.getScoresByCorps(corpsName);
    
    if (scores.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No scores found for ${corpsName}`
      });
    }
    
    res.json({
      success: true,
      data: {
        corps: corpsName,
        scores: scores,
        totalScores: scores.length,
        averageScore: scores.reduce((sum, score) => sum + score.score, 0) / scores.length
      }
    });
  } catch (error) {
    console.error('Error fetching corps scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch corps scores',
      error: error.message
    });
  }
});

// Get top scores
router.get('/top/:count?', authenticateToken, async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 10;
    const scores = parser.getTopScores(count);
    
    res.json({
      success: true,
      data: {
        scores: scores,
        totalScores: scores.length,
        requestedCount: count
      }
    });
  } catch (error) {
    console.error('Error fetching top scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top scores',
      error: error.message
    });
  }
});

// Get latest scores
router.get('/latest/:count?', authenticateToken, async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 10;
    const scores = parser.getLatestScores(count);
    
    res.json({
      success: true,
      data: {
        scores: scores,
        totalScores: scores.length,
        requestedCount: count
      }
    });
  } catch (error) {
    console.error('Error fetching latest scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest scores',
      error: error.message
    });
  }
});

// Get latest score for each corps
router.get('/latest/corps', authenticateToken, async (req, res) => {
  try {
    const scores = parser.getLatestCorpsScores();
    
    res.json({
      success: true,
      data: {
        corpsScores: scores,
        totalCorps: scores.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching latest corps scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest corps scores',
      error: error.message
    });
  }
});

// Calculate fantasy scores for draft results
router.post('/calculate', authenticateToken, async (req, res) => {
  try {
    const { draftResults } = req.body;
    

    
    if (!draftResults) {
      return res.status(400).json({
        success: false,
        message: 'Draft results are required'
      });
    }

    const allScores = scoreCalculator.calculateAllScores(draftResults);
    const leaderboard = scoreCalculator.getLeaderboard(draftResults);
    const corpsRankings = scoreCalculator.getCorpsRankings();
    const bestPossible = scoreCalculator.getBestPossibleScore();
    const worstPossible = scoreCalculator.getWorstPossibleScore();

    res.json({
      success: true,
      data: {
        memberScores: allScores,
        leaderboard: leaderboard,
        corpsRankings: corpsRankings,
        bestPossibleScore: bestPossible,
        worstPossibleScore: worstPossible,
        totalMembers: Object.keys(draftResults).length
      }
    });
  } catch (error) {
    console.error('Error calculating fantasy scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate fantasy scores',
      error: error.message
    });
  }
});

// Get corps rankings
router.get('/rankings', authenticateToken, async (req, res) => {
  try {
    const rankings = scoreCalculator.getCorpsRankings();
    
    res.json({
      success: true,
      data: {
        rankings: rankings,
        totalCorps: rankings.length
      }
    });
  } catch (error) {
    console.error('Error fetching corps rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch corps rankings',
      error: error.message
    });
  }
});

module.exports = router; 