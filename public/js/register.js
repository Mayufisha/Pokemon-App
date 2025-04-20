document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submit-btn");
  const errorMsg = document.getElementById("error-message");

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

      if (password !== confirmPassword) {
        errorMsg.textContent = "Passwords do not match";
        errorMsg.classList.remove("hidden");
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = "Signing Up...";

      // Submit form to API
      try {
        console.log("Submitting registration form");

        const requestData = { username, email, password };
        console.log(
          "Sending data to /api/signup:",
          JSON.stringify(requestData)
        );

        const res = await fetch(`/api/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
          credentials: "include", // Important: include cookies in the request
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }

        // Handle successful response
        console.log("Server response:", data);

        // Show success message briefly before redirect
        const successMessage = document.createElement("div");
        successMessage.className =
          "bg-green-600/70 text-white p-2 rounded text-center mt-2";
        successMessage.textContent =
          "Registration successful! Redirecting to login...";

        const form = document.getElementById("register-form");
        form.parentNode.insertBefore(successMessage, form.nextSibling);

        // Redirect to login page
        setTimeout(() => {
          window.location.href = "/login-page";
        }, 2000);
      } catch (err) {
        console.error("Registration error:", err);
        errorMsg.textContent = err.message;
        errorMsg.classList.remove("hidden");
      } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign Up";
      }
    });
});
