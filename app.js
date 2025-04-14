const express = require("express");
const path = require("path");
const connectDB = require("./database");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

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
  res.redirect("/login");
};

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api", authRoutes);
app.use("/api/user", userRoutes);

// Front-end Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
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
  res.redirect("/login");
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
  console.log(`Pokédex app listening at http://localhost:${port}`);
});
