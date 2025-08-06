const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  roster: {
    brass: [{
      corps: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Corps'
      },
      round: Number,
      pick: Number
    }],
    percussion: [{
      corps: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Corps'
      },
      round: Number,
      pick: Number
    }],
    guard: [{
      corps: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Corps'
      },
      round: Number,
      pick: Number
    }],
    visual: [{
      corps: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Corps'
      },
      round: Number,
      pick: Number
    }],
    generalEffect: [{
      corps: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Corps'
      },
      round: Number,
      pick: Number
    }]
  },
  scores: {
    brass: {
      total: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      best: { type: Number, default: 0 }
    },
    percussion: {
      total: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      best: { type: Number, default: 0 }
    },
    guard: {
      total: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      best: { type: Number, default: 0 }
    },
    visual: {
      total: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      best: { type: Number, default: 0 }
    },
    generalEffect: {
      total: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      best: { type: Number, default: 0 }
    },
    overall: {
      total: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      best: { type: Number, default: 0 }
    }
  },
  rank: {
    type: Number,
    default: null
  },
  season: {
    type: Number,
    default: new Date().getFullYear()
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add corps to roster
teamSchema.methods.addCorps = function(corpsId, section, round, pick) {
  if (!this.roster[section]) {
    throw new Error(`Invalid section: ${section}`);
  }
  
  this.roster[section].push({
    corps: corpsId,
    round,
    pick
  });
  
  return this;
};

// Remove corps from roster
teamSchema.methods.removeCorps = function(corpsId, section) {
  if (!this.roster[section]) {
    throw new Error(`Invalid section: ${section}`);
  }
  
  this.roster[section] = this.roster[section].filter(
    item => item.corps.toString() !== corpsId.toString()
  );
  
  return this;
};

// Calculate team scores
teamSchema.methods.calculateScores = async function() {
  const Corps = mongoose.model('Corps');
  
  for (const section of Object.keys(this.roster)) {
    const corpsIds = this.roster[section].map(item => item.corps);
    const corps = await Corps.find({ _id: { $in: corpsIds } });
    
    const sectionScores = corps.map(c => c.sections[section]?.score || 0).filter(score => score > 0);
    
    if (sectionScores.length > 0) {
      this.scores[section].total = sectionScores.reduce((sum, score) => sum + score, 0);
      this.scores[section].average = this.scores[section].total / sectionScores.length;
      this.scores[section].best = Math.max(...sectionScores);
    }
  }
  
  // Calculate overall scores
  const sectionTotals = Object.values(this.scores)
    .filter(score => typeof score === 'object' && score.total)
    .map(score => score.total);
  
  if (sectionTotals.length > 0) {
    this.scores.overall.total = sectionTotals.reduce((sum, total) => sum + total, 0);
    this.scores.overall.average = this.scores.overall.total / sectionTotals.length;
    this.scores.overall.best = Math.max(...sectionTotals);
  }
  
  return this;
};

// Get team summary
teamSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    user: this.user,
    league: this.league,
    scores: this.scores,
    rank: this.rank,
    rosterSize: {
      brass: this.roster.brass.length,
      percussion: this.roster.percussion.length,
      guard: this.roster.guard.length,
      visual: this.roster.visual.length,
      generalEffect: this.roster.generalEffect.length
    }
  };
};

// Get roster with corps details
teamSchema.methods.getRosterWithDetails = async function() {
  const Corps = mongoose.model('Corps');
  const User = mongoose.model('User');
  
  const roster = {};
  
  for (const section of Object.keys(this.roster)) {
    const corpsIds = this.roster[section].map(item => item.corps);
    const corps = await Corps.find({ _id: { $in: corpsIds } });
    
    roster[section] = this.roster[section].map(item => {
      const corpsData = corps.find(c => c._id.toString() === item.corps.toString());
      return {
        ...item.toObject(),
        corps: corpsData ? {
          _id: corpsData._id,
          name: corpsData.name,
          abbreviation: corpsData.abbreviation,
          sectionScore: corpsData.sections[section]?.score || 0,
          sectionRank: corpsData.sections[section]?.rank || null
        } : null
      };
    });
  }
  
  return roster;
};

module.exports = mongoose.model('Team', teamSchema); 