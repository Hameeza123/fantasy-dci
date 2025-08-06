const mongoose = require('mongoose');

const corpsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  abbreviation: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 5
  },
  location: {
    city: String,
    state: String,
    country: {
      type: String,
      default: 'USA'
    }
  },
  founded: {
    type: Number
  },
  division: {
    type: String,
    enum: ['World Class', 'Open Class', 'All-Age'],
    default: 'World Class'
  },
  sections: {
    brass: {
      score: {
        type: Number,
        min: 0,
        max: 20
      },
      rank: Number,
      lastUpdated: Date
    },
    percussion: {
      score: {
        type: Number,
        min: 0,
        max: 20
      },
      rank: Number,
      lastUpdated: Date
    },
    guard: {
      score: {
        type: Number,
        min: 0,
        max: 20
      },
      rank: Number,
      lastUpdated: Date
    },
    visual: {
      score: {
        type: Number,
        min: 0,
        max: 20
      },
      rank: Number,
      lastUpdated: Date
    },
    generalEffect: {
      score: {
        type: Number,
        min: 0,
        max: 20
      },
      rank: Number,
      lastUpdated: Date
    }
  },
  totalScore: {
    type: Number,
    min: 0,
    max: 100
  },
  overallRank: Number,
  logo: String,
  website: String,
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  season: {
    type: Number,
    default: new Date().getFullYear()
  }
}, {
  timestamps: true
});

// Calculate total score from section scores
corpsSchema.methods.calculateTotalScore = function() {
  const sections = this.sections;
  let total = 0;
  let count = 0;
  
  Object.keys(sections).forEach(section => {
    if (sections[section].score !== undefined && sections[section].score !== null) {
      total += sections[section].score;
      count++;
    }
  });
  
  this.totalScore = count > 0 ? total : null;
  return this.totalScore;
};

// Update section score
corpsSchema.methods.updateSectionScore = function(section, score, rank) {
  if (this.sections[section]) {
    this.sections[section].score = score;
    this.sections[section].rank = rank;
    this.sections[section].lastUpdated = new Date();
    this.calculateTotalScore();
  }
};

// Get corps performance data
corpsSchema.methods.getPerformanceData = function() {
  return {
    name: this.name,
    abbreviation: this.abbreviation,
    totalScore: this.totalScore,
    overallRank: this.overallRank,
    sections: this.sections,
    season: this.season
  };
};

module.exports = mongoose.model('Corps', corpsSchema); 