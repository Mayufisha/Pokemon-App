document.addEventListener('DOMContentLoaded', () => {
    let isSignup = false;
  
    const formTitle = document.getElementById('form-title');
    const toggleBtn = document.getElementById('toggle-btn');
    const submitBtn = document.getElementById('submit-btn');
    const emailInput = document.getElementById('email');
    const errorMsg = document.getElementById('error-message');
  
    toggleBtn.addEventListener('click', () => {
      isSignup = !isSignup;
      formTitle.textContent = isSignup ? "Sign Up" : "Login";
      submitBtn.textContent = isSignup ? "Sign Up" : "Login";
      toggleBtn.textContent = isSignup ? "Already have an account? Login" : "Don't have an account? Sign up";
      emailInput.classList.toggle('hidden');
      errorMsg.classList.add('hidden');
    });
    
    document.getElementById('auth-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.classList.add('hidden');
    
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const email = emailInput.value.trim();
    
        try {
          const res = await fetch(`http://localhost:3000/api/${isSignup ? 'signup' : 'login'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, ...(isSignup && { email }) }),
          });
    
          const data = await res.json();
    
          if (!res.ok) throw new Error(data.error || "Something went wrong");
    
          alert(data.message || "Success!");
          if (!isSignup) window.location.href = "dashboard.html";
        } catch (err) {
          errorMsg.textContent = err.message;
          errorMsg.classList.remove('hidden');
        }
      });
    
  });
  