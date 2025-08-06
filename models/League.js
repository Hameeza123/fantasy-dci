const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  commissioner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['commissioner', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    maxMembers: {
      type: Number,
      default: 12,
      min: 2,
      max: 20
    },
    draftOrder: {
      type: String,
      enum: ['snake', 'linear'],
      default: 'snake'
    },
    sections: {
      brass: {
        enabled: { type: Boolean, default: true },
        rounds: { type: Number, default: 3, min: 1, max: 10 }
      },
      percussion: {
        enabled: { type: Boolean, default: true },
        rounds: { type: Number, default: 3, min: 1, max: 10 }
      },
      guard: {
        enabled: { type: Boolean, default: true },
        rounds: { type: Number, default: 3, min: 1, max: 10 }
      },
      visual: {
        enabled: { type: Boolean, default: true },
        rounds: { type: Number, default: 3, min: 1, max: 10 }
      },
      generalEffect: {
        enabled: { type: Boolean, default: true },
        rounds: { type: Number, default: 3, min: 1, max: 10 }
      }
    },
    season: {
      type: Number,
      default: new Date().getFullYear()
    }
  },
  status: {
    type: String,
    enum: ['setup', 'drafting', 'active', 'completed'],
    default: 'setup'
  },
  draftResults: {
    type: Object,
    default: null
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate invite code
leagueSchema.methods.generateInviteCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  this.inviteCode = result;
  return result;
};

// Add member to league
leagueSchema.methods.addMember = function(userId, role = 'member') {
  if (this.members.length >= this.settings.maxMembers) {
    throw new Error('League is full');
  }
  
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a member');
  }
  
  this.members.push({
    user: userId,
    role,
    joinedAt: new Date()
  });
  
  return this;
};

// Remove member from league
leagueSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this;
};

// Check if user is member
leagueSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString()
  );
};

// Check if user is commissioner
leagueSchema.methods.isCommissioner = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && 
    member.role === 'commissioner'
  );
};

module.exports = mongoose.model('League', leagueSchema); 