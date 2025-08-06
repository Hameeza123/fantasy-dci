const ScoreCalculator = require('./utils/scoreCalculator');

const calculator = new ScoreCalculator();

// Test data - section-based format (current format)
const sectionBasedDraftResults = {
  brass: [
    { corps: 'Bluecoats', member: 'member1', caption: 'Brass', round: 1 },
    { corps: 'Boston Crusaders', member: 'member2', caption: 'Brass', round: 1 },
    { corps: 'Blue Devils', member: 'member3', caption: 'Brass', round: 1 }
  ],
  percussion: [
    { corps: 'Blue Devils', member: 'member1', caption: 'Percussion', round: 1 },
    { corps: 'Carolina Crown', member: 'member2', caption: 'Percussion', round: 1 },
    { corps: 'Bluecoats', member: 'member3', caption: 'Percussion', round: 1 }
  ],
  guard: [
    { corps: 'Boston Crusaders', member: 'member1', caption: 'Color Guard', round: 1 },
    { corps: 'Bluecoats', member: 'member2', caption: 'Color Guard', round: 1 },
    { corps: 'Phantom Regiment', member: 'member3', caption: 'Color Guard', round: 1 }
  ],
  visual: [
    { corps: 'Carolina Crown', member: 'member1', caption: 'Visual', round: 1 },
    { corps: 'Blue Devils', member: 'member2', caption: 'Visual', round: 1 },
    { corps: 'Boston Crusaders', member: 'member3', caption: 'Visual', round: 1 }
  ],
  general: [
    { corps: 'Phantom Regiment', member: 'member1', caption: 'General Effect', round: 1 },
    { corps: 'Santa Clara Vanguard', member: 'member2', caption: 'General Effect', round: 1 },
    { corps: 'Carolina Crown', member: 'member3', caption: 'General Effect', round: 1 }
  ]
};

console.log('🎯 Testing Fantasy DCI Scoring System with Section-Based Format');
console.log('==============================================================\n');

// Test format conversion
console.log('📊 Testing Format Conversion:');
const member1Picks = calculator.convertToMemberFormat(sectionBasedDraftResults, 'member1');
console.log('Member 1 picks:', member1Picks);

const member2Picks = calculator.convertToMemberFormat(sectionBasedDraftResults, 'member2');
console.log('Member 2 picks:', member2Picks);

const member3Picks = calculator.convertToMemberFormat(sectionBasedDraftResults, 'member3');
console.log('Member 3 picks:', member3Picks);

// Test individual member scores
console.log('\n🏆 Individual Member Scores:');
console.log('Member 1:', calculator.calculateMemberScore(sectionBasedDraftResults, 'member1').toFixed(3));
console.log('Member 2:', calculator.calculateMemberScore(sectionBasedDraftResults, 'member2').toFixed(3));
console.log('Member 3:', calculator.calculateMemberScore(sectionBasedDraftResults, 'member3').toFixed(3));

// Test all scores calculation
console.log('\n📈 All Scores:');
const allScores = calculator.calculateAllScores(sectionBasedDraftResults);
Object.keys(allScores).forEach(memberId => {
  console.log(`${memberId}: ${allScores[memberId].totalScore.toFixed(3)}`);
});

// Test leaderboard
console.log('\n🏅 Leaderboard:');
const leaderboard = calculator.getLeaderboard(sectionBasedDraftResults);
leaderboard.forEach((entry, index) => {
  console.log(`#${index + 1}: ${entry.memberId} - ${entry.totalScore.toFixed(3)}`);
});

console.log('\n✅ Scoring system format conversion test completed!'); 