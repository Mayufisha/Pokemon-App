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
  
    
  });
  