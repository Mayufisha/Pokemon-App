const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// POST /api/login - User login
router.post("/login", async (req, res) => {
  try {
    console.log("Login attempt for:", req.body.username);

    const { username, password } = req.body;
    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({ error: "Invalid username or password" });
    }

    console.log("User found, validating password");
    // Validate password
    const isValidPassword = user.validatePassword(password);
    console.log("Password valid:", isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie with token
    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    // Log user activity
    user.logActivity("login");

    // Return success with user info
    return res.status(200).json({
      success: true,
      userId: user._id,
      username: user.username,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error during login" });
  }
});

// POST /api/signup - User registration
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Username or email already in use",
      });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
    });

    // Set password (this will hash it)
    newUser.setPassword(password);

    // Save user to database
    await newUser.save();

    // Log signup activity
    newUser.logActivity("signup");

    // Return success
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Error registering user" });
  }
});

// GET /api/logout - User logout
router.get("/logout", (req, res) => {
  // Clear auth cookie
  res.clearCookie("authToken", { path: "/" });

  // Return success
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
