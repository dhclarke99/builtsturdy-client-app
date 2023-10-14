const { Schema, model } = require('mongoose');

const recipeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  ingredients: [
    {
      name: String,
      quantity: Number,
      unit: String
    }
  ],
  instructions: String,
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Recipe = model('Recipe', recipeSchema);

module.exports = Recipe;
