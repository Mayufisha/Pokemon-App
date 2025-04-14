const users = require("../data/store");

function logUserEvent(username, action, details = {}) {
  const trimmedUsername = username.trim().toLowerCase();
  const user = users.find((u) => u.username.toLowerCase() === trimmedUsername);
  if (!user) return;

  user.timeline.push({
    action,
    details,
    createdAt: new Date(),
  });
}

module.exports = { logUserEvent };
