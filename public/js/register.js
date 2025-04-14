document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submit-btn");
  const errorMsg = document.getElementById("error-message");

  // Validate password
  const validatePassword = (password) => {
    // Password must be at least 6 characters
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  // Handle form submission
  document
    .getElementById("register-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMsg.classList.add("hidden");

      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      // Validate input
      if (!username || !email || !password || !confirmPassword) {
        errorMsg.textContent = "Please fill in all required fields";
        errorMsg.classList.remove("hidden");
        return;
      }

      // Validate username length
      if (username.length < 3) {
        errorMsg.textContent = "Username must be at least 3 characters long";
        errorMsg.classList.remove("hidden");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errorMsg.textContent = "Please enter a valid email address";
        errorMsg.classList.remove("hidden");
        return;
      }

      // Validate password
      const passwordError = validatePassword(password);
      if (passwordError) {
        errorMsg.textContent = passwordError;
        errorMsg.classList.remove("hidden");
        return;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        errorMsg.textContent = "Passwords do not match";
        errorMsg.classList.remove("hidden");
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating Account...";

      console.log("Submitting registration form");

      // Create the request data
      const requestData = { username, email, password };
      console.log("Sending data to /api/signup:", JSON.stringify(requestData));

      // Use fetch with more detailed error handling
      fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
        credentials: "include", // Include cookies for cross-origin requests if needed
      })
        .then((response) => {
          console.log("Registration response status:", response.status);

          // Parse the JSON response even for error responses
          return response.json().then((data) => {
            console.log("Registration response data:", data);

            // If the response status is not OK, throw an error with the message
            if (!response.ok) {
              throw new Error(data.error || "Registration failed");
            }

            return data;
          });
        })
        .then((data) => {
          // Handle successful registration
          console.log("Registration successful:", data);

          // Show success message
          const successMessage = document.createElement("div");
          successMessage.className =
            "bg-green-600/70 text-white p-2 rounded text-center mt-2";
          successMessage.textContent =
            "Account created successfully! Redirecting to login...";

          // Insert the success message after the form
          const form = document.getElementById("register-form");
          form.parentNode.insertBefore(successMessage, form.nextSibling);

          // Redirect to login page after a delay
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        })
        .catch((error) => {
          // Handle errors
          console.error("Registration error:", error);

          // Display the error message
          errorMsg.textContent =
            error.message || "An error occurred during registration";
          errorMsg.classList.remove("hidden");
        })
        .finally(() => {
          // Reset button state in any case
          submitBtn.disabled = false;
          submitBtn.textContent = "Sign Up";
        });
    });
});
