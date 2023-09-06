const db = require('../config/connection');
const { User, Workout, Exercise } = require('../models');

const exerciseData = require('./exerciseData.json');
const userData = require('./userData.json');
const workoutData = require('./workoutData.json');

db.once('open', async () => {
  // Delete existing data
  await User.deleteMany({});
  await Workout.deleteMany({});
  await Exercise.deleteMany({});

  // Insert new exercise data
  const exercises = await Exercise.insertMany(exerciseData);

  // Insert new workout data and replace placeholder exercise IDs with real ones
  const workoutDataWithRealIDs = workoutData.map((workout, index) => {
    return {
      ...workout,
      exercises: [exercises[index]._id]
    };
  });
  const workouts = await Workout.insertMany(workoutDataWithRealIDs);

  // Insert new user data and replace placeholder workout IDs with real ones
  const userDataWithRealWorkoutIDs = userData.map((user, index) => {
    return {
      ...user,
      workouts: [workouts[index]._id]
    };
  });
  await User.insertMany(userDataWithRealWorkoutIDs);

  console.log('all done!');
  process.exit(0);
});
