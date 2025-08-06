const fs = require('fs');
const path = require('path');

class DCIDataParser {
  constructor() {
    this.dataPath = path.join(__dirname, '../data/dciScores.json');
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    const dataDir = path.dirname(this.dataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  parseDetailedScores(rawData) {
    const lines = rawData.trim().split('\n');
    const scores = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Look for lines that contain corps names and caption scores
      // Pattern: CorpsName followed by tab-separated caption scores
      if (trimmedLine.includes('\t')) {
        const parts = trimmedLine.split('\t');
        const corpsName = parts[0].trim();
        
        if (corpsName && corpsName !== 'Corps' && corpsName !== 'Total') {
          // Try to extract caption-specific scores
          // Assuming format: CorpsName | Brass | Percussion | Color Guard | Visual | General Effect | Total
          const captionScores = {
            brass: 0,
            percussion: 0,
            colorguard: 0,
            visual: 0,
            generaleffect: 0
          };
          
          let totalScore = 0;
          
          // Parse caption scores from the parts
          if (parts.length >= 6) {
            // Try to extract individual caption scores
            for (let i = 1; i < parts.length - 1; i++) {
              const score = parseFloat(parts[i].trim());
              if (!isNaN(score) && score > 0) {
                // Map position to caption (this might need adjustment based on actual data format)
                if (i === 1) captionScores.brass = score;
                else if (i === 2) captionScores.percussion = score;
                else if (i === 3) captionScores.colorguard = score;
                else if (i === 4) captionScores.visual = score;
                else if (i === 5) captionScores.generaleffect = score;
              }
            }
            
            // Get total score (last numeric value)
            for (let i = parts.length - 1; i >= 0; i--) {
              const part = parts[i].trim();
              if (part && !isNaN(parseFloat(part)) && parseFloat(part) > 80) {
                totalScore = parseFloat(part);
                break;
              }
            }
          } else {
            // Fallback: just get total score
            for (let i = parts.length - 1; i >= 0; i--) {
              const part = parts[i].trim();
              if (part && !isNaN(parseFloat(part)) && parseFloat(part) > 80) {
                totalScore = parseFloat(part);
                break;
              }
            }
          }

          if (totalScore > 0) {
            const score = {
              corps: corpsName,
              score: totalScore,
              captions: captionScores,
              event: 'DCI World Championships',
              date: new Date().toISOString(),
              season: new Date().getFullYear()
            };
            scores.push(score);
          }
        }
      }
    }

    return scores;
  }

  saveData(scores) {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(scores, null, 2));
      console.log(`Saved ${scores.length} scores to ${this.dataPath}`);
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  loadData() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = fs.readFileSync(this.dataPath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading data:', error);
      return [];
    }
  }

  getAllScores() {
    return this.loadData();
  }

  getScoresByCorps(corpsName) {
    const allScores = this.loadData();
    return allScores.filter(score => 
      score.corps.toLowerCase().includes(corpsName.toLowerCase())
    );
  }

  getLatestScores(count = 20) {
    const allScores = this.loadData();
    return allScores
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, count);
  }

  getTopScores(count = 10) {
    const allScores = this.loadData();
    return allScores
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  getLatestCorpsScores() {
    const allScores = this.loadData();
    const corpsMap = new Map();
    
    allScores.forEach(score => {
      const existing = corpsMap.get(score.corps);
      if (!existing || new Date(score.date) > new Date(existing.date)) {
        corpsMap.set(score.corps, score);
      }
    });
    
    return Array.from(corpsMap.values())
      .sort((a, b) => b.score - a.score);
  }

  clearData() {
    try {
      if (fs.existsSync(this.dataPath)) {
        fs.unlinkSync(this.dataPath);
      }
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
}

module.exports = DCIDataParser; 