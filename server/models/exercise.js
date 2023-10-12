const { Schema, model } = require('mongoose');

const exerciseSchema = new Schema({
  name: String,
  notes: String,
  adminNotes: String,
  videoUrl: String,
  tag: String,
});

module.exports = model('Exercise', exerciseSchema);
