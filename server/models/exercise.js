const { Schema, model } = require('mongoose');

const exerciseSchema = new Schema({
  name: String,
  sets: Number,
  reps: Number,
  weight: Number,
  notes: String,
});

module.exports = model('Exercise', exerciseSchema);
