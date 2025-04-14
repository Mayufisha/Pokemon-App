const users = require("../data/store");
const { logUserEvent } = require("../utils/logevents");

exports.getTimeline = (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  const trimmedUsername = username.trim().toLowerCase();
  const user = users.find((u) => u.username.toLowerCase() === trimmedUsername);
  if (!user) {
    console.warn(
      `Attempt to access timeline for non-existent user: "${username}"`
    );
    return res.status(404).json({ message: "User not found" });
  }

  // Return only the user's own timeline
  const userTimeline = user.timeline.slice().reverse();
  res.json(userTimeline);
};

exports.addTimelineEntry = (req, res) => {
  const { username, action, details } = req.body;
  const trimmedUsername = username.trim().toLowerCase();
  logUserEvent(trimmedUsername, action, details);
  res.json({ message: `${action} logged` });
};

exports.handleOptions = (req, res) => {
  res.status(200).end();
};
