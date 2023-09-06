const { Schema, model } = require('mongoose');
const Exercise = require('./exercise');

const workoutSchema = new Schema({
  name: String,
  exercises: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }],
  notes: String
});

module.exports = model('Workout', workoutSchema);
