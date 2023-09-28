require('dotenv').config({ path: '../.env'});
const mongoose = require('mongoose');


const encodedPassword = encodeURIComponent(process.env.MONGODB_PASSWORD); // Replace with your actual password


mongoose.connect(
  
  `mongodb+srv://dhclarke99:${encodedPassword}@cluster0.x4rweq2.mongodb.net/BuiltSturdy-Client`, // Replace 'yourDatabaseName' with the name of your database
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  console.log("env file: ", process.env),
  console.log("password is ", encodedPassword),
  
);

module.exports = mongoose.connection;
