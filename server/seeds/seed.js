const db = require('../config/connection');
const { User, Exercise } = require('../models');
const userData = require('./userData.json');
const exerciseData = require('./exerciseData.json');

const seedDatabase = async () => {
  try {
    // Check if admin user already exists
    const adminUser = await User.findOne({ role: 'Admin' });
    
    if (!adminUser) {
      await User.create(userData[0]);
      console.log('Admin user seeded!');
    } else {
      console.log('Admin user already exists.');
    }

    const existingExerciseData = await Exercise.find({});
    
    if (existingExerciseData.length === 0) {
      await Exercise.insertMany(exerciseData);
      console.log('Exercise data seeded!');
    } else {
      console.log('Exercise data already exists.');
    }

    console.log('all done!');
    db.close();  // Close the database connection
  } catch (error) {
    console.error('An error occurred while seeding:', error);
  }
};

seedDatabase();  // Run the seed function
