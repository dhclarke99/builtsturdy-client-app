const { Schema, model } = require('mongoose');

// const exerciseSchema = new Schema({
//   exercise: {
//     type: Schema.Types.ObjectId,
//     ref: 'Exercise'
//   },
//   sets: Number,
//   targetReps: String
// });

const workoutSchema = new Schema({
  name: String,
  exercises: [{
    type: Schema.Types.ObjectId,
    ref: 'Exercise'
  }],
  notes: String,
  adminNotes: String
});

module.exports = model('Workout', workoutSchema);
