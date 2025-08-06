const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  currentRound: {
    type: Number,
    default: 1
  },
  currentPick: {
    type: Number,
    default: 1
  },
  currentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  draftOrder: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: Number
  }],
  picks: [{
    round: Number,
    pick: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    corps: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Corps'
    },
    section: {
      type: String,
      enum: ['brass', 'percussion', 'guard', 'visual', 'generalEffect']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    timeLimit: {
      type: Number,
      default: 60 // seconds
    }
  }],
  settings: {
    timeLimit: {
      type: Number,
      default: 60, // seconds per pick
      min: 30,
      max: 300
    },
    autoPick: {
      type: Boolean,
      default: true
    },
    sections: {
      brass: {
        enabled: { type: Boolean, default: true },
        rounds: { type: Number, default: 3 }
      },
      percussion: {
        enabled: { type: Boolean, default: true },
        rounds: { type: Number, default: 3 }
      },
      guard: {
        enabled: { type: Boolean, default: true },
        rounds: { type: Number, default: 3 }
      },
      visual: {
        enabled: { type: Boolean, default: true },
        rounds: { type: Number, default: 3 }
      },
      generalEffect: {
        enabled: { type: Boolean, default: true },
        rounds: { type: Number, default: 3 }
      }
    }
  },
  startedAt: Date,
  completedAt: Date,
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate draft order
draftSchema.methods.generateDraftOrder = function() {
  const league = this.league;
  const members = league.members.map(member => member.user);
  
  // Shuffle members for random draft order
  for (let i = members.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [members[i], members[j]] = [members[j], members[i]];
  }
  
  this.draftOrder = members.map((user, index) => ({
    user,
    position: index + 1
  }));
  
  return this.draftOrder;
};

// Get current picker
draftSchema.methods.getCurrentPicker = function() {
  if (this.status !== 'active') return null;
  
  const totalPicks = this.draftOrder.length;
  const pickIndex = (this.currentPick - 1) % totalPicks;
  
  // Handle snake draft
  const round = Math.floor((this.currentPick - 1) / totalPicks) + 1;
  const isReverseRound = round % 2 === 0;
  
  let actualIndex = pickIndex;
  if (isReverseRound) {
    actualIndex = totalPicks - 1 - pickIndex;
  }
  
  return this.draftOrder[actualIndex];
};

// Make a pick
draftSchema.methods.makePick = function(userId, corpsId, section) {
  if (this.status !== 'active') {
    throw new Error('Draft is not active');
  }
  
  const currentPicker = this.getCurrentPicker();
  if (!currentPicker || currentPicker.user.toString() !== userId.toString()) {
    throw new Error('Not your turn to pick');
  }
  
  // Check if corps is already drafted for this section
  const existingPick = this.picks.find(pick => 
    pick.corps.toString() === corpsId.toString() && 
    pick.section === section
  );
  
  if (existingPick) {
    throw new Error('Corps already drafted for this section');
  }
  
  // Add the pick
  const pick = {
    round: this.currentRound,
    pick: this.currentPick,
    user: userId,
    corps: corpsId,
    section,
    timestamp: new Date(),
    timeLimit: this.settings.timeLimit
  };
  
  this.picks.push(pick);
  
  // Move to next pick
  this.currentPick++;
  this.currentUser = this.getCurrentPicker()?.user;
  this.lastActivity = new Date();
  
  // Check if round is complete
  const picksThisRound = this.picks.filter(p => p.round === this.currentRound);
  if (picksThisRound.length >= this.draftOrder.length) {
    this.currentRound++;
  }
  
  // Check if draft is complete
  const totalRounds = this.getTotalRounds();
  if (this.currentRound > totalRounds) {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return pick;
};

// Get total rounds for draft
draftSchema.methods.getTotalRounds = function() {
  let totalRounds = 0;
  Object.keys(this.settings.sections).forEach(section => {
    if (this.settings.sections[section].enabled) {
      totalRounds += this.settings.sections[section].rounds;
    }
  });
  return totalRounds;
};

// Get available corps for section
draftSchema.methods.getAvailableCorps = function(section) {
  const draftedCorps = this.picks
    .filter(pick => pick.section === section)
    .map(pick => pick.corps.toString());
  
  return draftedCorps;
};

// Get user's picks
draftSchema.methods.getUserPicks = function(userId) {
  return this.picks.filter(pick => 
    pick.user.toString() === userId.toString()
  );
};

// Auto-pick for user
draftSchema.methods.autoPick = function(userId) {
  const currentPicker = this.getCurrentPicker();
  if (!currentPicker || currentPicker.user.toString() !== userId.toString()) {
    throw new Error('Not your turn to pick');
  }
  
  // Find best available corps for any section
  // This is a simplified auto-pick - you could make it more sophisticated
  const availableCorps = this.getAvailableCorps('brass'); // Simplified
  if (availableCorps.length > 0) {
    return this.makePick(userId, availableCorps[0], 'brass');
  }
  
  throw new Error('No available corps for auto-pick');
};

module.exports = mongoose.model('Draft', draftSchema); 