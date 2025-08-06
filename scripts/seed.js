const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedDatabase } = require('../utils/seedData');

// Load environment variables
dotenv.config();

const seed = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fantasy-dci', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Seed the database
    await seedDatabase();
    
    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seed function
seed(); 