const express = require('express');
const Corps = require('../models/Corps');
const { corpsValidation, paramValidation, queryValidation } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all corps
router.get('/', queryValidation.pagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, division, season, search } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { isActive: true };
    if (division) query.division = division;
    if (season) query.season = parseInt(season);
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { abbreviation: { $regex: search, $options: 'i' } }
      ];
    }
    
    const corps = await Corps.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await Corps.countDocuments(query);
    
    res.json({
      corps,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get corps error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get corps by ID
router.get('/:corpsId', paramValidation.corpsId, async (req, res) => {
  try {
    const corps = await Corps.findById(req.params.corpsId);
    if (!corps) {
      return res.status(404).json({ message: 'Corps not found' });
    }
    
    res.json({ corps });
  } catch (error) {
    console.error('Get corps by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new corps (admin only)
router.post('/', authenticateToken, requireAdmin, corpsValidation.create, async (req, res) => {
  try {
    const corpsData = req.body;
    corpsData.season = corpsData.season || new Date().getFullYear();
    
    const corps = new Corps(corpsData);
    await corps.save();
    
    res.status(201).json({
      message: 'Corps created successfully',
      corps
    });
  } catch (error) {
    console.error('Create corps error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Corps with this name or abbreviation already exists'
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update corps (admin only)
router.put('/:corpsId', authenticateToken, requireAdmin, paramValidation.corpsId, async (req, res) => {
  try {
    const { name, abbreviation, location, division, founded, logo, website, socialMedia } = req.body;
    
    const corps = await Corps.findById(req.params.corpsId);
    if (!corps) {
      return res.status(404).json({ message: 'Corps not found' });
    }
    
    // Update fields
    if (name) corps.name = name;
    if (abbreviation) corps.abbreviation = abbreviation;
    if (location) corps.location = location;
    if (division) corps.division = division;
    if (founded) corps.founded = founded;
    if (logo) corps.logo = logo;
    if (website) corps.website = website;
    if (socialMedia) corps.socialMedia = socialMedia;
    
    await corps.save();
    
    res.json({
      message: 'Corps updated successfully',
      corps
    });
  } catch (error) {
    console.error('Update corps error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Corps with this name or abbreviation already exists'
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update corps score (admin only)
router.put('/:corpsId/scores', authenticateToken, requireAdmin, paramValidation.corpsId, corpsValidation.updateScore, async (req, res) => {
  try {
    const { section, score, rank } = req.body;
    
    const corps = await Corps.findById(req.params.corpsId);
    if (!corps) {
      return res.status(404).json({ message: 'Corps not found' });
    }
    
    // Update section score
    corps.updateSectionScore(section, score, rank);
    await corps.save();
    
    res.json({
      message: 'Score updated successfully',
      corps: corps.getPerformanceData()
    });
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get corps rankings by section
router.get('/rankings/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const { season } = req.query;
    
    if (!['brass', 'percussion', 'guard', 'visual', 'generalEffect'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }
    
    const query = { isActive: true };
    if (season) query.season = parseInt(season);
    
    const corps = await Corps.find(query)
      .sort({ [`sections.${section}.score`]: -1 })
      .select(`name abbreviation sections.${section} totalScore overallRank`);
    
    const rankings = corps
      .filter(c => c.sections[section]?.score)
      .map((c, index) => ({
        rank: index + 1,
        corps: {
          _id: c._id,
          name: c.name,
          abbreviation: c.abbreviation
        },
        score: c.sections[section].score,
        totalScore: c.totalScore,
        overallRank: c.overallRank
      }));
    
    res.json({ rankings });
  } catch (error) {
    console.error('Get rankings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get corps by division
router.get('/division/:division', async (req, res) => {
  try {
    const { division } = req.params;
    const { season } = req.query;
    
    if (!['World Class', 'Open Class', 'All-Age'].includes(division)) {
      return res.status(400).json({ message: 'Invalid division' });
    }
    
    const query = { division, isActive: true };
    if (season) query.season = parseInt(season);
    
    const corps = await Corps.find(query)
      .sort({ totalScore: -1 })
      .select('name abbreviation totalScore overallRank');
    
    res.json({ corps });
  } catch (error) {
    console.error('Get corps by division error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search corps
router.get('/search', queryValidation.search, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }
    
    const corps = await Corps.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { abbreviation: { $regex: q, $options: 'i' } }
      ]
    })
    .sort({ name: 1 })
    .limit(10)
    .select('name abbreviation division totalScore');
    
    res.json({ corps });
  } catch (error) {
    console.error('Search corps error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete corps (admin only)
router.delete('/:corpsId', authenticateToken, requireAdmin, paramValidation.corpsId, async (req, res) => {
  try {
    const corps = await Corps.findById(req.params.corpsId);
    if (!corps) {
      return res.status(404).json({ message: 'Corps not found' });
    }
    
    corps.isActive = false;
    await corps.save();
    
    res.json({ message: 'Corps deactivated successfully' });
  } catch (error) {
    console.error('Delete corps error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 