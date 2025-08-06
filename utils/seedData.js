const Corps = require('../models/Corps');
const User = require('../models/User');

const sampleCorps = [
  {
    name: 'Blue Devils',
    abbreviation: 'BD',
    location: { city: 'Concord', state: 'CA' },
    founded: 1957,
    division: 'World Class',
    sections: {
      brass: { score: 19.8, rank: 1, lastUpdated: new Date() },
      percussion: { score: 19.6, rank: 2, lastUpdated: new Date() },
      guard: { score: 19.9, rank: 1, lastUpdated: new Date() },
      visual: { score: 19.7, rank: 1, lastUpdated: new Date() },
      generalEffect: { score: 19.8, rank: 1, lastUpdated: new Date() }
    },
    totalScore: 98.8,
    overallRank: 1,
    logo: 'https://example.com/bd-logo.png',
    website: 'https://bluedevils.org',
    season: 2024
  },
  {
    name: 'Carolina Crown',
    abbreviation: 'CROWN',
    location: { city: 'Fort Mill', state: 'SC' },
    founded: 1988,
    division: 'World Class',
    sections: {
      brass: { score: 19.9, rank: 1, lastUpdated: new Date() },
      percussion: { score: 19.4, rank: 3, lastUpdated: new Date() },
      guard: { score: 19.6, rank: 2, lastUpdated: new Date() },
      visual: { score: 19.5, rank: 2, lastUpdated: new Date() },
      generalEffect: { score: 19.7, rank: 2, lastUpdated: new Date() }
    },
    totalScore: 98.1,
    overallRank: 2,
    logo: 'https://example.com/crown-logo.png',
    website: 'https://carolinacrown.org',
    season: 2024
  },
  {
    name: 'Bluecoats',
    abbreviation: 'BLOO',
    location: { city: 'Canton', state: 'OH' },
    founded: 1972,
    division: 'World Class',
    sections: {
      brass: { score: 19.6, rank: 3, lastUpdated: new Date() },
      percussion: { score: 19.8, rank: 1, lastUpdated: new Date() },
      guard: { score: 19.5, rank: 3, lastUpdated: new Date() },
      visual: { score: 19.4, rank: 3, lastUpdated: new Date() },
      generalEffect: { score: 19.6, rank: 3, lastUpdated: new Date() }
    },
    totalScore: 97.9,
    overallRank: 3,
    logo: 'https://example.com/bloo-logo.png',
    website: 'https://bluecoats.com',
    season: 2024
  },
  {
    name: 'Santa Clara Vanguard',
    abbreviation: 'SCV',
    location: { city: 'Santa Clara', state: 'CA' },
    founded: 1967,
    division: 'World Class',
    sections: {
      brass: { score: 19.4, rank: 4, lastUpdated: new Date() },
      percussion: { score: 19.5, rank: 4, lastUpdated: new Date() },
      guard: { score: 19.7, rank: 2, lastUpdated: new Date() },
      visual: { score: 19.3, rank: 4, lastUpdated: new Date() },
      generalEffect: { score: 19.5, rank: 4, lastUpdated: new Date() }
    },
    totalScore: 97.4,
    overallRank: 4,
    logo: 'https://example.com/scv-logo.png',
    website: 'https://scvanguard.org',
    season: 2024
  },
  {
    name: 'Boston Crusaders',
    abbreviation: 'BAC',
    location: { city: 'Boston', state: 'MA' },
    founded: 1940,
    division: 'World Class',
    sections: {
      brass: { score: 19.3, rank: 5, lastUpdated: new Date() },
      percussion: { score: 19.3, rank: 5, lastUpdated: new Date() },
      guard: { score: 19.4, rank: 4, lastUpdated: new Date() },
      visual: { score: 19.2, rank: 5, lastUpdated: new Date() },
      generalEffect: { score: 19.4, rank: 5, lastUpdated: new Date() }
    },
    totalScore: 96.6,
    overallRank: 5,
    logo: 'https://example.com/bac-logo.png',
    website: 'https://bostoncrusaders.org',
    season: 2024
  },
  {
    name: 'The Cavaliers',
    abbreviation: 'CAVS',
    location: { city: 'Rosemont', state: 'IL' },
    founded: 1948,
    division: 'World Class',
    sections: {
      brass: { score: 19.2, rank: 6, lastUpdated: new Date() },
      percussion: { score: 19.2, rank: 6, lastUpdated: new Date() },
      guard: { score: 19.3, rank: 5, lastUpdated: new Date() },
      visual: { score: 19.1, rank: 6, lastUpdated: new Date() },
      generalEffect: { score: 19.3, rank: 6, lastUpdated: new Date() }
    },
    totalScore: 96.1,
    overallRank: 6,
    logo: 'https://example.com/cavs-logo.png',
    website: 'https://cavaliers.org',
    season: 2024
  },
  {
    name: 'Phantom Regiment',
    abbreviation: 'PHAN',
    location: { city: 'Rockford', state: 'IL' },
    founded: 1956,
    division: 'World Class',
    sections: {
      brass: { score: 19.1, rank: 7, lastUpdated: new Date() },
      percussion: { score: 19.1, rank: 7, lastUpdated: new Date() },
      guard: { score: 19.2, rank: 6, lastUpdated: new Date() },
      visual: { score: 19.0, rank: 7, lastUpdated: new Date() },
      generalEffect: { score: 19.2, rank: 7, lastUpdated: new Date() }
    },
    totalScore: 95.6,
    overallRank: 7,
    logo: 'https://example.com/phantom-logo.png',
    website: 'https://regiment.org',
    season: 2024
  },
  {
    name: 'Blue Knights',
    abbreviation: 'BK',
    location: { city: 'Denver', state: 'CO' },
    founded: 1958,
    division: 'World Class',
    sections: {
      brass: { score: 19.0, rank: 8, lastUpdated: new Date() },
      percussion: { score: 19.0, rank: 8, lastUpdated: new Date() },
      guard: { score: 19.1, rank: 7, lastUpdated: new Date() },
      visual: { score: 18.9, rank: 8, lastUpdated: new Date() },
      generalEffect: { score: 19.1, rank: 8, lastUpdated: new Date() }
    },
    totalScore: 95.1,
    overallRank: 8,
    logo: 'https://example.com/bk-logo.png',
    website: 'https://ascendperformingarts.org',
    season: 2024
  },
  {
    name: 'Mandarins',
    abbreviation: 'MAND',
    location: { city: 'Sacramento', state: 'CA' },
    founded: 1963,
    division: 'World Class',
    sections: {
      brass: { score: 18.9, rank: 9, lastUpdated: new Date() },
      percussion: { score: 18.9, rank: 9, lastUpdated: new Date() },
      guard: { score: 19.0, rank: 8, lastUpdated: new Date() },
      visual: { score: 18.8, rank: 9, lastUpdated: new Date() },
      generalEffect: { score: 19.0, rank: 9, lastUpdated: new Date() }
    },
    totalScore: 94.6,
    overallRank: 9,
    logo: 'https://example.com/mand-logo.png',
    website: 'https://mandarins.org',
    season: 2024
  },
  {
    name: 'Crossmen',
    abbreviation: 'XMEN',
    location: { city: 'San Antonio', state: 'TX' },
    founded: 1975,
    division: 'World Class',
    sections: {
      brass: { score: 18.8, rank: 10, lastUpdated: new Date() },
      percussion: { score: 18.8, rank: 10, lastUpdated: new Date() },
      guard: { score: 18.9, rank: 9, lastUpdated: new Date() },
      visual: { score: 18.7, rank: 10, lastUpdated: new Date() },
      generalEffect: { score: 18.9, rank: 10, lastUpdated: new Date() }
    },
    totalScore: 94.1,
    overallRank: 10,
    logo: 'https://example.com/xmen-logo.png',
    website: 'https://crossmen.org',
    season: 2024
  }
];

const seedCorps = async () => {
  try {
    // Clear existing corps data
    await Corps.deleteMany({});
    
    // Insert sample corps
    const insertedCorps = await Corps.insertMany(sampleCorps);
    
    console.log(`Successfully seeded ${insertedCorps.length} corps`);
    return insertedCorps;
  } catch (error) {
    console.error('Error seeding corps:', error);
    throw error;
  }
};

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }
    
    const adminUser = new User({
      username: 'admin',
      email: 'admin@fantasydci.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true
    });
    
    await adminUser.save();
    console.log('Admin user created successfully');
    return adminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Seed corps data
    await seedCorps();
    
    // Create admin user
    await createAdminUser();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
};

module.exports = {
  seedCorps,
  createAdminUser,
  seedDatabase
}; 