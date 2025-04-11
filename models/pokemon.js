const mongoose = require("mongoose");

// Schema for saved/favorite Pokemon
const pokemonSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pokemonId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  sprite: {
    type: String,
    required: true,
  },
  types: [
    {
      type: String,
      required: true,
    },
  ],
  isFavorite: {
    type: Boolean,
    default: false,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
});

// Add a compound index to prevent duplicates for the same user
pokemonSchema.index({ userId: 1, pokemonId: 1 }, { unique: true });

const Pokemon = mongoose.model("Pokemon", pokemonSchema);

module.exports = Pokemon;
