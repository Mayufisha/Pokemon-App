const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Route for the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "default.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Pokédex app listening at http://localhost:${port}`);
});
