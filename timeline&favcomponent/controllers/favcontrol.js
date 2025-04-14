const users = require("../data/store");
const { logUserEvent } = require("../utils/logevents");

exports.addFavorite = (req, res) => {
  const { username, pokemonId, name, imageUrl, notes } = req.body;
  if (!username || !pokemonId || !name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const trimmedUsername = username.trim().toLowerCase();
  const user = users.find((u) => u.username.toLowerCase() === trimmedUsername);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.favorites.some((fav) => fav.pokemonId === pokemonId)) {
    return res.status(400).json({ message: "Already in favorites" });
  }

  user.favorites.push({ pokemonId, name, imageUrl, notes });
  logUserEvent(user.username, "ADD_FAVORITE", { pokemonId, name, notes });

  res.json({ message: "Added to favorites", favorites: user.favorites });
};

exports.removeFavorite = (req, res) => {
  const { username, pokemonId } = req.body;
  if (!username) {
    return res.status(401).json({ message: "Please login first" });
  }

  const trimmedUsername = username.trim().toLowerCase();
  const user = users.find((u) => u.username.toLowerCase() === trimmedUsername);
  if (!user) return res.status(404).json({ message: "User not found" });

  const index = user.favorites.findIndex((fav) => fav.pokemonId === pokemonId);
  if (index === -1)
    return res.status(404).json({ message: "Not in favorites" });

  const removed = user.favorites.splice(index, 1)[0];
  logUserEvent(user.username, "REMOVE_FAVORITE", {
    pokemonId,
    name: removed.name,
  });

  res.json({ message: "Removed from favorites", favorites: user.favorites });
};

exports.getFavorites = (req, res) => {
  const { username } = req.query;
  const trimmedUsername = username.trim().toLowerCase();
  const user = users.find((u) => u.username.toLowerCase() === trimmedUsername);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ favorites: user.favorites });
};
