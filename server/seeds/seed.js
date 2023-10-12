const db = require('../config/connection');
const { User, Exercise } = require('../models'); // Assuming you have an Exercise model
const userData = require('./userData.json');
const exerciseData = require('./exerciseData.json'); // Assuming you have an exerciseData.json file

const seedDatabase = async () => {
  // Check if admin user already exists
  const adminUser = await User.findOne({ role: 'Admin' });
  
  if (!adminUser) {
    // If no admin user exists, seed the admin user
    await User.create(userData[0]); // Assuming the admin data is the first object in userData.json
    console.log('Admin user seeded!');
  } else {
    console.log('Admin user already exists.');
  }

  // Check if exercise data already exists
  const existingExerciseData = await Exercise.find({}); // Assuming you have an Exercise model
  
  if (existingExerciseData.length === 0) {
    // If no exercise data exists, seed the exercise data
    await Exercise.insertMany(exerciseData);
    console.log('Exercise data seeded!');
  } else {
    console.log('Exercise data already exists.');
  }

  console.log('all done!');
};

module.exports = seedDatabase;
