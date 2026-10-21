// Auth logic for Login and Signup
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const alertBox = document.getElementById("alert-box");

  // Helper to show alert
  function showAlert(message, type = "error") {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = "block";
  }

  // Clear alert
  function clearAlert() {
    if (!alertBox) return;
    alertBox.style.display = "none";
    alertBox.textContent = "";
  }

  // Helper to parse error responses
  function extractErrorMessage(data) {
    if (data.error) return data.error;
    if (data.message && data.message !== "Validation Error") return data.message;
    if (data.errors) {
      if (Array.isArray(data.errors)) {
        return data.errors.map(err => err.message).join(", ");
      }
      return typeof data.errors === "string" ? data.errors : JSON.stringify(data.errors);
    }
    return "An unexpected error occurred.";
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAlert();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const submitBtn = loginForm.querySelector("button[type='submit']");

      if (!email || !password) {
        showAlert("Please fill in both email and password.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Logging in...";

      try {
        const response = await fetch("/api/v1/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Save token & user
          localStorage.setItem("auth_token", data.data.token);
          localStorage.setItem("auth_user", JSON.stringify(data.data.user));

          showAlert("Logged in successfully! Redirecting...", "success");
          setTimeout(() => {
            window.location.href = "index.html";
          }, 800);
        } else {
          showAlert(extractErrorMessage(data), "error");
        }
      } catch (err) {
        console.error(err);
        showAlert("Failed to connect to the server. Is it running?", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Log In";
      }
    });
  }

  // Handle Signup
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAlert();

      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const submitBtn = signupForm.querySelector("button[type='submit']");

      if (!username || !email || !password) {
        showAlert("All fields are required.");
        return;
      }

      if (username.length < 5) {
        showAlert("Username must be at least 5 characters long.");
        return;
      }

      if (password.length < 5) {
        showAlert("Password must be at least 5 characters long.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Creating account...";

      try {
        const response = await fetch("/api/v1/users/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Save token & user
          localStorage.setItem("auth_token", data.data.token);
          localStorage.setItem("auth_user", JSON.stringify(data.data.user));

          showAlert("Account created successfully! Redirecting...", "success");
          setTimeout(() => {
            window.location.href = "index.html";
          }, 800);
        } else {
          showAlert(extractErrorMessage(data), "error");
        }
      } catch (err) {
        console.error(err);
        showAlert("Failed to connect to the server. Is it running?", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign Up";
      }
    });
  }
});
