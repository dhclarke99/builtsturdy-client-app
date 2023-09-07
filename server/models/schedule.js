const { Schema, model } = require('mongoose');
const Workout = require('./workout');

const scheduleSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    workouts: [
      {
        workoutId: {
          type: Schema.Types.ObjectId,
          ref: 'Workout',
        },
        day: String, // e.g., 'Monday', '2021-09-05'
      },
    ],
  });
  
  module.exports = model('Schedule', scheduleSchema);;
  