const mongoose = require("mongoose");
const crypto = require("crypto");

// Schema for user activity
const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "login",
      "signup",
      "add_favorite",
      "remove_favorite",
      "view_pokemon",
    ],
    required: true,
  },
  pokemonId: {
    type: Number,
    default: null,
  },
  pokemonName: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

// Schema for users
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  activities: [activitySchema],
});

// Method to set password
userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hashedPassword = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
    .toString("hex");
};

// Method to validate password
userSchema.methods.validatePassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
    .toString("hex");
  return this.hashedPassword === hash;
};

// Method to log user activity
userSchema.methods.logActivity = function (activityType, data = {}) {
  const activity = {
    type: activityType,
    timestamp: new Date(),
    ...data,
  };

  this.activities.push(activity);
  return this.save();
};

const User = mongoose.model("User", userSchema);

module.exports = User;
