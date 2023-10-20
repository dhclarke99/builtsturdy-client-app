const { Schema, model } = require('mongoose');

const exerciseSchema = new Schema({
  name: String,
  notes: String,
  adminNotes: String,
  videoUrl: String,
  tag: {
    type: String,
    enum: ['Strength', 'Cardio', 'Abs', 'Plyometric', 'Warm Up'],
},
});

module.exports = model('Exercise', exerciseSchema);
