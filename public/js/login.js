document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submit-btn");
  const errorMsg = document.getElementById("error-message");
  const rememberCheckbox = document.getElementById("remember-me");

  // Check for saved credentials
  const loadSavedCredentials = () => {
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");

    if (savedUsername && savedPassword) {
      document.getElementById("username").value = savedUsername;
      document.getElementById("password").value = savedPassword;
      rememberCheckbox.checked = true;
    }
  };

  // Load saved credentials on initial page load
  loadSavedCredentials();

  // Handle form submission
  document
    .getElementById("login-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMsg.classList.add("hidden");

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;
      const remember = rememberCheckbox.checked;

      // Validate input
      if (!username || !password) {
        errorMsg.textContent = "Please fill in all required fields";
        errorMsg.classList.remove("hidden");
        return;
      }

      // Save credentials if "Remember me" is checked
      if (remember) {
        localStorage.setItem("savedUsername", username);
        localStorage.setItem("savedPassword", password);
      } else {
        localStorage.removeItem("savedUsername");
        localStorage.removeItem("savedPassword");
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = "Logging In...";

      // Submit form to API
      try {
        console.log("Submitting login form");

        const requestData = { username, password };
        console.log("Sending data to /api/login:", JSON.stringify(requestData));

        const res = await fetch(`/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
          credentials: "include", // Important: include cookies in the request
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Invalid username or password");
        }

        // Handle successful response
        console.log("Server response:", data);

        // Store user data in session storage (for client-side use)
        sessionStorage.setItem("userId", data.userId);
        sessionStorage.setItem("username", data.username);
        sessionStorage.setItem("loggedIn", "true");

        // Show success message briefly before redirect
        const successMessage = document.createElement("div");
        successMessage.className =
          "bg-green-600/70 text-white p-2 rounded text-center mt-2";
        successMessage.textContent = "Login successful! Redirecting...";

        const form = document.getElementById("login-form");
        form.parentNode.insertBefore(successMessage, form.nextSibling);

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "/registered";
        }, 1000);
      } catch (err) {
        console.error("Login error:", err);
        errorMsg.textContent = err.message;
        errorMsg.classList.remove("hidden");
      } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = "Login";
      }
    });
});
