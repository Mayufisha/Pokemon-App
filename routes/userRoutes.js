const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Pokemon = require("../models/pokemon");
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
  try {
    const user = req.user;
    res.status(200).json({
      userId: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Server error" });
  }
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

// Route to log user activity
router.post("/log-activity", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const { type, pokemonId, pokemonName, details } = req.body;

    // Create activity object
    const activity = {
      type,
      timestamp: new Date(),
      pokemonId,
      pokemonName,
      details: details || {},
    };

    // Add activity to user's activities array
    user.activities.push(activity);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Activity logged successfully",
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get user's activities
router.get("/activities", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;

    // Sort activities by timestamp (newest first)
    const activities = user.activities.sort(
      (a, b) => b.timestamp - a.timestamp
    );

    res.status(200).json({
      activities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get user's favorite Pokémon
router.get("/favorites", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;

    // Find all Pokémon marked as favorites for this user
    const favorites = await Pokemon.find({
      userId: user._id,
      isFavorite: true,
    });

    res.status(200).json({
      favorites,
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to add a Pokémon to favorites
router.post("/favorites", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const { pokemonId, name, sprite, types } = req.body;

    if (!pokemonId || !name) {
      return res
        .status(400)
        .json({ error: "Missing required Pokémon information" });
    }

    // Check if this Pokémon is already a favorite
    const existingFavorite = await Pokemon.findOne({
      userId: user._id,
      pokemonId: pokemonId,
    });

    if (existingFavorite) {
      // If already exists but not marked as favorite, update it
      if (!existingFavorite.isFavorite) {
        existingFavorite.isFavorite = true;
        await existingFavorite.save();
      }

      return res.status(200).json({
        success: true,
        message: "Pokémon is already in favorites",
      });
    }

    // Create new Pokemon favorite
    const newFavorite = new Pokemon({
      userId: user._id,
      pokemonId: parseInt(pokemonId),
      name,
      sprite,
      types,
      isFavorite: true,
    });

    await newFavorite.save();

    // Log activity
    const activity = {
      type: "add_favorite",
      timestamp: new Date(),
      pokemonId: parseInt(pokemonId),
      pokemonName: name,
    };

    user.activities.push(activity);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Pokémon added to favorites",
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to remove a Pokémon from favorites
router.delete("/favorites/:pokemonId", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const pokemonId = parseInt(req.params.pokemonId);

    // Find the favorite Pokémon
    const favorite = await Pokemon.findOne({
      userId: user._id,
      pokemonId: pokemonId,
    });

    if (!favorite) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    // Either delete the entry or just mark as not favorite
    // Option 1: Delete the entry completely
    await Pokemon.deleteOne({ _id: favorite._id });

    // Option 2: Just mark as not favorite
    // favorite.isFavorite = false;
    // await favorite.save();

    // Log activity
    const activity = {
      type: "remove_favorite",
      timestamp: new Date(),
      pokemonId: pokemonId,
      pokemonName: favorite.name,
    };

    user.activities.push(activity);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Pokémon removed from favorites",
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
