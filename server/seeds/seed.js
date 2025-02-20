const db = require('../config/connection');
const { User, Exercise } = require('../models');
const userData = require('./userData.json');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  try {
    // Find and delete the existing Admin user
    const deletedAdmin = await User.findOneAndDelete({ role: 'Admin' });

    if (deletedAdmin) {
      console.log(`Deleted existing Admin user: ${deletedAdmin.email}`);
    } else {
      console.log('No existing Admin user found.');
    }

    // Hash the new Admin user's password before inserting
    const saltRounds = 10;
    userData[0].password = await bcrypt.hash(userData[0].password, saltRounds);

    await User.create(userData[0]);
    console.log('New Admin user seeded!');

    console.log('All done!');
    db.close(); // Close the database connection
  } catch (error) {
    console.error('An error occurred while seeding:', error);
  }
};

seedDatabase(); // Run the seed function
