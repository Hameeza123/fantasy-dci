const DCIDataParser = require('./parseDciData');

class ScoreCalculator {
  constructor() {
    this.parser = new DCIDataParser();
    this.scores = this.parser.getAllScores();
  }

  // Calculate total score for a member's team
  calculateMemberScore(draftResults, memberId) {
    if (!draftResults) {
      return 0;
    }

    let totalScore = 0;
    let memberPicks = {};

    // Check if draftResults is in member-based format
    if (draftResults[memberId]) {
      memberPicks = draftResults[memberId];
    } else {
      // Convert from section-based format to member-based format
      memberPicks = this.convertToMemberFormat(draftResults, memberId);
    }

    if (Object.keys(memberPicks).length === 0) {
      return 0;
    }

    // Calculate score for each caption
    Object.keys(memberPicks).forEach(caption => {
      const corps = memberPicks[caption];
      console.log('Processing caption:', caption, 'corps:', corps, 'type:', typeof corps);
      const corpsScore = this.getCorpsScore(corps, caption);
      totalScore += corpsScore;
    });

    return totalScore;
  }

  // Convert section-based draft results to member-based format
  convertToMemberFormat(draftResults, memberId) {
    const memberPicks = {};
    
    // Check if it's the new 8-caption format
    const sections = ['ge1', 'ge2', 'visualproficiency', 'visualanalysis', 'colorguard', 'musicbrass', 'musicanalysis', 'musicpercussion'];
    
    sections.forEach(section => {
      if (draftResults[section] && Array.isArray(draftResults[section])) {
        const memberPick = draftResults[section].find(pick => pick.member === memberId);
        if (memberPick) {
          // Convert section key to caption name
          const captionMap = {
            'ge1': 'General Effect 1',
            'ge2': 'General Effect 2',
            'visualproficiency': 'Visual Proficiency',
            'visualanalysis': 'Visual Analysis',
            'colorguard': 'Color Guard',
            'musicbrass': 'Music Brass',
            'musicanalysis': 'Music Analysis',
            'musicpercussion': 'Music Percussion'
          };
          
          memberPicks[captionMap[section]] = memberPick.corps;
        }
      }
    });
    
    // Also handle legacy format for backward compatibility
    if (draftResults.brass || draftResults.percussion || draftResults.guard || draftResults.visual || draftResults.general) {
      const legacySections = ['brass', 'percussion', 'guard', 'visual', 'general'];
      
      legacySections.forEach(section => {
        if (draftResults[section] && Array.isArray(draftResults[section])) {
          const memberPick = draftResults[section].find(pick => pick.member === memberId);
          if (memberPick) {
            const captionMap = {
              'brass': 'Brass',
              'percussion': 'Percussion', 
              'guard': 'Color Guard',
              'visual': 'Visual',
              'general': 'General Effect'
            };
            
            memberPicks[captionMap[section]] = memberPick.corps;
          }
        }
      });
    }
    
    return memberPicks;
  }

  // Get score for a specific corps and caption
  getCorpsScore(corpsName, caption = null) {
    console.log('getCorpsScore called with:', { corpsName, caption, corpsNameType: typeof corpsName });
    if (!corpsName || typeof corpsName !== 'string') {
      console.error('Invalid corpsName:', corpsName, typeof corpsName);
      return 0;
    }
    
    const corpsData = this.scores.find(score => 
      score.corps.toLowerCase() === corpsName.toLowerCase()
    );
    
    if (!corpsData) return 0;
    
    // If caption is specified, try to get caption-specific score
    if (caption && corpsData.captions) {
      // Map fantasy captions to DCI caption structure
      const captionMapping = {
        'brass': 'musicbrass',
        'percussion': 'musicpercussion', 
        'colorguard': 'colorguard',
        'visual': 'visualproficiency', // Use Visual Proficiency as main visual score
        'generaleffect': 'ge1', // Use GE1 as main general effect score
        'generaleffect1': 'ge1',
        'generaleffect2': 'ge2',
        'visualproficiency': 'visualproficiency',
        'visualanalysis': 'visualanalysis',
        'musicbrass': 'musicbrass',
        'musicanalysis': 'musicanalysis',
        'musicpercussion': 'musicpercussion'
      };
      
      const processedCaption = caption.toLowerCase().replace(/ /g, '');
      const captionKey = captionMapping[processedCaption] || processedCaption;
      
      console.log('Caption mapping debug:', {
        originalCaption: caption,
        processedCaption: processedCaption,
        captionKey: captionKey,
        availableCaptions: Object.keys(corpsData.captions),
        foundScore: corpsData.captions[captionKey]
      });
      
      if (corpsData.captions[captionKey]) {
        const score = corpsData.captions[captionKey];
        
        // Apply scoring adjustments: cut Visual, Music, and Color Guard scores in half, keep GE scores as is
        if (captionKey.startsWith('visual') || captionKey.startsWith('music') || captionKey === 'colorguard') {
          return score / 2;
        } else {
          return score;
        }
      }
    }
    
    // Fallback to total score if no caption-specific score available
    return corpsData.score || 0;
  }

  // Calculate scores for all members
  calculateAllScores(draftResults) {
    if (!draftResults) return {};

    const memberScores = {};
    
    // Extract member IDs from the new 8-caption format
    const memberIds = new Set();
    const sections = ['ge1', 'ge2', 'visualproficiency', 'visualanalysis', 'colorguard', 'musicbrass', 'musicanalysis', 'musicpercussion'];
    
    sections.forEach(section => {
      if (draftResults[section] && Array.isArray(draftResults[section])) {
        draftResults[section].forEach(pick => {
          if (pick.member) {
            memberIds.add(pick.member);
          }
        });
      }
    });
    
    // Calculate scores for each member
    memberIds.forEach(memberId => {
      const memberPicks = this.convertToMemberFormat(draftResults, memberId);
      memberScores[memberId] = {
        totalScore: this.calculateMemberScore(draftResults, memberId),
        picks: memberPicks,
        breakdown: this.getScoreBreakdown(memberPicks)
      };
    });

    return memberScores;
  }

  // Get detailed breakdown of scores
  getScoreBreakdown(memberPicks) {
    if (!memberPicks) return {};

    const breakdown = {};
    let totalScore = 0;

    Object.keys(memberPicks).forEach(caption => {
      const corps = memberPicks[caption];
      const corpsScore = this.getCorpsScore(corps, caption);
      breakdown[caption] = {
        corps: corps,
        score: corpsScore
      };
      totalScore += corpsScore;
    });

    breakdown.total = totalScore;
    return breakdown;
  }

  // Get leaderboard sorted by score
  getLeaderboard(draftResults) {
    const allScores = this.calculateAllScores(draftResults);
    
    return Object.keys(allScores)
      .map(memberId => ({
        memberId,
        ...allScores[memberId]
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  // Get corps rankings for reference
  getCorpsRankings() {
    return this.scores
      .sort((a, b) => b.score - a.score)
      .map((score, index) => ({
        rank: index + 1,
        corps: score.corps,
        score: score.score
      }));
  }

  // Get average score for a corps across all captions
  getCorpsAverageScore(corpsName) {
    const corpsData = this.scores.find(score => 
      score.corps.toLowerCase() === corpsName.toLowerCase()
    );
    
    return corpsData ? corpsData.score : 0;
  }

  // Get best possible score (if someone had all top corps)
  getBestPossibleScore() {
    const topScores = this.scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 corps for 5 captions
    
    return topScores.reduce((sum, score) => sum + score.score, 0);
  }

  // Get worst possible score (if someone had all bottom corps)
  getWorstPossibleScore() {
    const bottomScores = this.scores
      .sort((a, b) => a.score - b.score)
      .slice(0, 5); // Bottom 5 corps for 5 captions
    
    return bottomScores.reduce((sum, score) => sum + score.score, 0);
  }
}

module.exports = ScoreCalculator; 