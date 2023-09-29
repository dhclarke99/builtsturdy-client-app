const db = require('../config/connection');
const { User } = require('../models');
const userData = require('./userData.json');

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

  // You can add more seeding logic here if needed

  console.log('all done!');
};

module.exports = seedDatabase;
