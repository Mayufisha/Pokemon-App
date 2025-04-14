const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Load environment variables
require("dotenv").config();

// Set JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
  let userId;

  // Check for auth token in cookies first
  const token = req.cookies.authToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      console.error("Token verification failed:", error);
    }
  }

  // If no token or invalid token, check for user-id header as fallback
  if (!userId && req.headers["user-id"]) {
    userId = req.headers["user-id"];
  }

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Route to get user profile
router.get("/profile", isAuthenticated, async (req, res) => {
  // Existing code...
});

// Route to handle logout
router.post("/logout", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;

    // Log logout activity
    const activity = {
      type: "logout",
      timestamp: new Date(),
      details: {
        userAgent: req.headers["user-agent"],
      },
    };

    user.activities.push(activity);
    await user.save();

    // Clear the auth cookie
    res.clearCookie("authToken", { path: "/" });

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Other routes...

module.exports = router;
