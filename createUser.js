// Save this as createUser.js
const mongoose = require("mongoose");
const User = require("./models/user");
require("dotenv").config();

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Create a new user
    const newUser = new User({
      username: "testuser",
      email: "test@example.com",
    });

    // Set the password (this will hash it)
    newUser.setPassword("password123");

    // Save the user
    await newUser.save();
    console.log("Test user created successfully");

    // Close the connection
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error creating test user:", error);
  }
}

createTestUser();
