const { Schema, model } = require('mongoose');
const Workout = require('./workout');

const scheduleSchema = new Schema({
    name: {
      type: String,
      require: true,
  },
    notes: String,
    adminNotes: String,
    type: {  // New field to indicate the type of schedule
      type: String,
      enum: ['Repeating', 'Alternating'],
      required: false,
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
  