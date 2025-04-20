// Updated timeline.js with date grouping and Pokemon icons
document.addEventListener("DOMContentLoaded", function () {
  // Check if we're on a page that should have the timeline
  const timelineToggle = document.getElementById("toggle-timeline");
  const detailsContainer = document.getElementById("details-container");

  // If the required elements don't exist, exit early
  if (!timelineToggle || !detailsContainer) {
    console.log("Timeline elements not found on this page");
    return; // Exit the function if elements aren't found
  }

  let activitiesLoaded = false;
  let showingTimeline = false;
  let originalContent = "";

  // Initialize timeline toggle
  timelineToggle.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link behavior

    // Toggle timeline visibility
    showingTimeline = !showingTimeline;

    if (showingTimeline) {
      // Save the current details content
      originalContent = detailsContainer.innerHTML;

      // Create timeline container
      const timelineHTML = `
        <div class="activity-timeline">
          <div class="timeline-header">
            <h3>Your Activity Timeline</h3>
          </div>
          <div id="timeline-content">
            <div class="timeline-empty">Loading activities...</div>
          </div>
        </div>
      `;

      // Replace the Pokemon details with the timeline
      detailsContainer.innerHTML = timelineHTML;

      // Load activities if not already loaded
      loadActivities();
    } else {
      // Restore the original content
      detailsContainer.innerHTML = originalContent;

      // Re-attach event listeners to the restored content
      reattachEventListeners();
    }
  });

  // Function to load user activities
  function loadActivities() {
    const userId = sessionStorage.getItem("userId");
    const timelineContent = document.getElementById("timeline-content");

    if (!timelineContent) {
      console.error("Timeline content element not found");
      return;
    }

    // Update loading message
    timelineContent.innerHTML =
      '<div class="timeline-empty">Loading activities...</div>';

    // Check if userId exists
    if (!userId) {
      timelineContent.innerHTML =
        '<div class="timeline-empty">Please log in to see your activities</div>';
      return;
    }

    fetch("/api/user/activities", {
      credentials: "include",
      headers: {
        "user-id": userId,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.activities) {
          displayActivitiesByDate(data.activities);
          activitiesLoaded = true;
        } else {
          throw new Error("Invalid response format");
        }
      })
      .catch((error) => {
        console.error("Error loading activities:", error);
        timelineContent.innerHTML = `
        <div class="timeline-empty">
          <p>Could not load activities. Please try again later.</p>
          <p class="error-details">${error.message}</p>
        </div>
      `;
      });
  }

  // Function to display activities grouped by date
  function displayActivitiesByDate(activities) {
    const timelineContent = document.getElementById("timeline-content");
    if (!timelineContent) return;

    if (!activities || activities.length === 0) {
      timelineContent.innerHTML = `
        <div class="timeline-empty">
          <p>No activities recorded yet.</p>
        </div>
      `;
      return;
    }

    // Group activities by date
    const groupedByDate = {};

    activities.forEach((activity) => {
      let dateKey = "Unknown date";
      try {
        const date = new Date(activity.timestamp);
        dateKey = date.toLocaleDateString();
      } catch (e) {
        console.error("Error formatting date:", e);
      }

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }

      groupedByDate[dateKey].push(activity);
    });

    // Build HTML for each date group
    let timelineHtml = "";

    Object.keys(groupedByDate)
      .sort((a, b) => {
        // Sort dates in reverse order (newest first)
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB - dateA;
      })
      .forEach((dateKey) => {
        const dayActivities = groupedByDate[dateKey];

        timelineHtml += `
        <div class="timeline-date-group">
          <div class="timeline-date-header">
            <span>${dateKey}</span>
          </div>
          <div class="timeline-date-activities">
      `;

        dayActivities
          .sort((a, b) => {
            // Sort activities within a day (newest first)
            return new Date(b.timestamp) - new Date(a.timestamp);
          })
          .forEach((activity) => {
            // Format time without the date
            let formattedTime = "Unknown time";
            try {
              const date = new Date(activity.timestamp);
              formattedTime = date.toLocaleTimeString();
            } catch (e) {
              console.error("Error formatting time:", e);
            }

            // Create activity title and details
            let title = "";
            let details = "";
            let iconHtml = "";

            switch (activity?.type) {
              case "login":
                title = "Logged in";
                details = "You signed into your account";
                break;

              case "signup":
                title = "Created account";
                details = "You created your Pokémon account";
                break;

              case "add_favorite":
                title = "Added to favorites";
                // Add Pokemon icon if we have a Pokemon ID
                if (activity.pokemonId) {
                  iconHtml = `
                <div class="pokemon-icon">
                  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                    activity.pokemonId
                  }.png" 
                       alt="${activity.pokemonName || "Pokemon"}" 
                       title="${activity.pokemonName || "Pokemon"}">
                </div>
              `;
                }
                details = activity.pokemonName
                  ? `You added <span class="pokemon-link">${activity.pokemonName}</span> to favorites`
                  : "You added a Pokémon to favorites";
                break;

              case "remove_favorite":
                title = "Removed from favorites";
                // Add Pokemon icon if we have a Pokemon ID
                if (activity.pokemonId) {
                  iconHtml = `
                <div class="pokemon-icon">
                  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                    activity.pokemonId
                  }.png" 
                       alt="${activity.pokemonName || "Pokemon"}" 
                       title="${activity.pokemonName || "Pokemon"}">
                </div>
              `;
                }
                details = activity.pokemonName
                  ? `You removed <span class="pokemon-link">${activity.pokemonName}</span> from favorites`
                  : "You removed a Pokémon from favorites";
                break;

              case "view_pokemon":
                title = "Viewed Pokémon";
                // Add Pokemon icon if we have a Pokemon ID
                if (activity.pokemonId) {
                  iconHtml = `
                <div class="pokemon-icon">
                  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                    activity.pokemonId
                  }.png" 
                       alt="${activity.pokemonName || "Pokemon"}" 
                       title="${activity.pokemonName || "Pokemon"}">
                </div>
              `;
                }
                details = activity.pokemonName
                  ? `You viewed <span class="pokemon-link">${activity.pokemonName}</span>'s details`
                  : "You viewed a Pokémon's details";
                break;

              case "view_pokedex":
                title = "Browsed Pokémon";
                details = "You browsed the Pokémon";
                break;

              case "logout":
                title = "Logged out";
                details = "You signed out of your account";
                break;

              default:
                title = "Activity recorded";
                details = `Activity type: ${activity?.type || "unknown"}`;
            }

            // Add any extra details if they exist
            if (
              activity?.details &&
              typeof activity.details === "object" &&
              Object.keys(activity.details).length > 0
            ) {
              // Handle specific detail types
              if (activity.details.page) {
                details += ` on ${activity.details.page} page`;
              }
            }

            timelineHtml += `
          <div class="timeline-item ${activity?.type || "unknown"}">
            <div class="timeline-time">${formattedTime}</div>
            <div class="timeline-content">
              ${iconHtml}
              <div class="timeline-activity">
                <div class="timeline-title">${title}</div>
                <div class="timeline-details">${details}</div>
              </div>
            </div>
          </div>
        `;
          });

        timelineHtml += `
          </div>
        </div>
      `;
      });

    timelineContent.innerHTML = timelineHtml;

    // Add click handlers for Pokémon links
    document.querySelectorAll(".pokemon-link").forEach((link) => {
      link.addEventListener("click", () => {
        // If there's a Pokémon ID available, we could load that specific Pokémon
        const pokemonName = link.textContent;
        // You could implement logic here to show that Pokémon

        // Hide timeline and revert to Pokemon display
        showingTimeline = false;
        detailsContainer.innerHTML = originalContent;
        reattachEventListeners();
      });
    });
  }

  // Reattach event listeners to the restored Pokemon content
  function reattachEventListeners() {
    // This would be needed to reattach click handlers to the cards and other elements
    // Similar to what is done in the main.js/dashboard.js after displaying Pokemon
    // The implementation depends on your specific needs

    // For example:
    document.querySelectorAll(".pokemon-details-card").forEach((card) => {
      card.addEventListener("click", () => {
        // Your click handler code
      });
    });

    document.querySelectorAll(".favorite-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Your favorite button handler
      });
    });

    // Add more event listeners as needed
  }
});

// Keep the logUserActivity function as is
function logUserActivity(activityType, data = {}) {
  const userId = sessionStorage.getItem("userId");

  if (!userId) {
    console.warn("Cannot log activity: User not logged in");
    return Promise.reject("User not logged in");
  }

  return fetch("/api/user/log-activity", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "user-id": userId,
    },
    body: JSON.stringify({
      type: activityType,
      pokemonId: data.pokemonId || null,
      pokemonName: data.pokemonName || null,
      details: data.details || {},
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to log activity");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error logging activity:", error);
      return { success: false, error: error.message };
    });
}
