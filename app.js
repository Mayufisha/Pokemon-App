const express = require("express");
const path = require("path");
const connectDB = require("./database");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const User = require("./models/user");

// Load environment variables
require("dotenv").config();

// Set JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Set models path
const modelsPath = path.join(__dirname, "models");

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// IMPORTANT: Initialize middleware BEFORE defining routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json()); // This is redundant with express.json() but keeping for compatibility

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  // Check for auth token in cookies
  const token = req.cookies.authToken;

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { userId: decoded.userId };
      return next();
    } catch (error) {
      console.error("Token verification failed:", error);
    }
  }

  // For API requests, also check for user-id header as fallback
  if (req.headers["user-id"]) {
    return next();
  }

  // Not authenticated, redirect to login
  res.redirect("/login-page");
};

// Add direct login route after middleware is initialized
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user || !user.validatePassword(password)) {
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
    });

    // Return success with user info
    return res.json({
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

// Test API endpoint
app.post("/test-api", (req, res) => {
  console.log("Test API request body:", req.body);
  res.json({ message: "Test API working", received: req.body });
});

// API Routes - must be defined BEFORE static file middleware
app.use("/api", authRoutes);
app.use("/api/user", userRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Front-end Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Login page route - renamed to avoid conflict with API
app.get("/login-page", (req, res) => {
  // If already logged in (has valid auth cookie), redirect to registered page
  const token = req.cookies.authToken;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect("/registered");
    } catch (error) {
      // Invalid token, clear it
      res.clearCookie("authToken");
    }
  }

  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login-page");
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Protected routes
app.get("/registered", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "default.html"));
});

app.get("/favorites", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favorites.html"));
});

// Timeline page - Requires authentication
app.get("/timeline", async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    const activities = user.activities.sort(
      (a, b) => b.timestamp - a.timestamp
    );

    res.render("timeline", {
      title: "Activity Timeline",
      activities,
    });
  } catch (error) {
    console.error("Error fetching timeline:", error);
    res.status(500).render("timeline", {
      title: "Activity Timeline",
      error: "Failed to fetch timeline",
      activities: [],
    });
  }
});

app.get("/activities", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "activities.html"));
});

app.get("/profile", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "profile.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
app.listen(port, () => {
  console.log(`Pokémon app listening at http://localhost:${port}`);
});
