const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Load environment variables
require("dotenv").config();

// Set JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Route to register a new user
router.post("/signup", async (req, res) => {
  // Existing signup code...
});

// Route to login a user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user || !user.validatePassword(password)) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Log login activity with user agent info
    const loginActivity = {
      type: "login",
      timestamp: new Date(),
      details: { userAgent: req.headers["user-agent"] },
    };

    user.activities.push(loginActivity);
    await user.save();

    console.log(`User logged in: ${user.username} (${user._id})`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" } // Token expires in 24 hours
    );

    // Set cookie with the token
    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "strict",
      path: "/",
    });

    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// Add a logout route to clear the cookie
router.post("/logout", (req, res) => {
  res.clearCookie("authToken", { path: "/" });
  res.status(200).json({ message: "Logged out successfully" });
});

// Other routes...

module.exports = router;
