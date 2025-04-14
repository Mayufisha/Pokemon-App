document.getElementById("login-btn").addEventListener("click", async () => {
  let username = prompt("Enter your username:");
  if (!username) return;

  username = username.trim().toLowerCase();
  localStorage.setItem("username", username);
  try {
    await logEvent(username, "LOGIN", { message: "User logged in" });
    document.querySelector(".timeline-container").style.display = "block"; // Show timeline after login
    loadTimeline();
  } catch (error) {
    console.error("Failed to log in:", error);
    alert("An error occurred while logging in. Please try again.");
  }
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  const username = localStorage.getItem("username");
  if (!username) {
    alert("You are not logged in!");
    return;
  }

  try {
    await logEvent(username, "LOGOUT", { message: "User logged out" });
    localStorage.removeItem("username");

    // Only clear favorites, keep timeline visible
    const favoritesList = document.getElementById("favorites-list");
    favoritesList.classList.remove("show");
    document.getElementById("favorites-container").innerHTML = "";

    // Reload timeline to show all events including logout
    loadTimeline();
  } catch (error) {
    console.error("Failed to log out:", error);
    alert("An error occurred while logging out. Please try again.");
  }
});

async function logEvent(username, action, details) {
  try {
    await fetch("http://localhost:5000/api/timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, action, details }),
    });
  } catch (error) {
    console.error("Failed to log event:", error);
    throw error;
  }
}

document.addEventListener("click", async (e) => {
  const card = e.target.closest(".pokemon-card");
  if (!card && !e.target.classList.contains("remove-from-list")) return;

  const username = localStorage.getItem("username");
  if (!username) {
    alert("Please login first");
    document.getElementById("login-btn").click();
    return;
  }

  try {
    if (e.target.classList.contains("add-favorite-btn")) {
      const pokemonId = parseInt(card.dataset.id);
      const name = card.dataset.name;
      const imageUrl = card.dataset.img;
      const notes = card.querySelector(".favorite-note")?.value || "";

      const response = await fetch("http://localhost:5000/api/favorites/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pokemonId, name, imageUrl, notes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add favorite");
      }

      card.querySelector(".favorite-note").value = "";
      await loadFavorites();
      await loadTimeline();
    }

    if (
      e.target.classList.contains("remove-from-list") ||
      e.target.classList.contains("remove-favorite-btn")
    ) {
      const pokemonId = parseInt(e.target.dataset.id || card.dataset.id);

      const response = await fetch(
        "http://localhost:5000/api/favorites/remove",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, pokemonId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove favorite");
      }

      await loadFavorites();
      await loadTimeline();
    }
  } catch (error) {
    console.error("Failed to update favorites:", error);
    alert(error.message || "An error occurred while updating favorites");
  }
});

async function loadTimeline() {
  const container = document.getElementById("timeline-list");
  const username = localStorage.getItem("username");

  if (!username) {
    document.querySelector(".timeline-container").style.display = "none";
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/timeline?username=${username}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        localStorage.removeItem("username");
        alert("User not found. Please log in again.");
        document.getElementById("login-btn").click(); // Trigger login prompt
        return;
      }
      throw new Error(`Server responded with status ${response.status}`);
    }

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Unexpected response format");
    }

    const timeline = await response.json();

    container.innerHTML = timeline
      .map((event) => {
        return `
        <div class="timeline-item">
          <div class="timeline-content">
            <p>${getActionText(event)}</p>
            <small>${new Date(event.createdAt).toLocaleString()}</small>
          </div>
        </div>
      `;
      })
      .join("");
  } catch (error) {
    console.error("Failed to load timeline:", error);
    container.innerHTML = `
      <p>An error occurred while loading the timeline. Please try again later.</p>
      <p><small>Error details: ${error.message}</small></p>
    `;
  }
}

function getActionText(event) {
  const { action, details } = event;
  switch (action) {
    case "LOGIN":
      return "Logged in";
    case "LOGOUT":
      return "Logged out";
    case "ADD_FAVORITE":
      return `Added ${details.name} to favorites${
        details.notes ? ` with note: ${details.notes}` : ""
      }`;
    case "REMOVE_FAVORITE":
      return `Removed ${details.name} from favorites`;
    default:
      return `Action: ${action}`;
  }
}

// Replace the toggle-favorites event listener with automatic loading
document.addEventListener("DOMContentLoaded", () => {
  loadFavorites();
  // Hide timeline container initially
  const timelineContainer = document.querySelector(".timeline-container");
  if (!localStorage.getItem("username")) {
    timelineContainer.style.display = "none";
  }
});

async function loadFavorites() {
  const username = localStorage.getItem("username");
  const container = document.getElementById("favorites-container");

  if (!username) {
    container.innerHTML = "<p>Please login first to see your favorites</p>";
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/favorites?username=${username}`
    );
    if (!response.ok) throw new Error("Failed to fetch favorites");

    const { favorites } = await response.json();

    if (favorites.length === 0) {
      container.innerHTML = "<p>No favorites added yet</p>";
      return;
    }

    container.innerHTML = favorites
      .map(
        (fav) => `
      <div class="favorite-item" data-id="${fav.pokemonId}">
        <img src="${fav.imageUrl}" alt="${fav.name}" style="width: 50px;">
        <span>${fav.name}</span>
        <p>${fav.notes || ""}</p>
        <button class="remove-from-list" data-id="${
          fav.pokemonId
        }">Remove</button>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Failed to load favorites:", error);
    container.innerHTML = "<p>Error loading favorites</p>";
  }
}
