// Simple authentication handler (client-side simulation)
/* global localStorage */

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      // Simple validation (in production, this would be server-side)
      if (email && password) {
        // Store user info
        localStorage.setItem('user', JSON.stringify({ email, name: email.split('@')[0] }));
        localStorage.setItem('isLoggedIn', 'true');

        // Show success and redirect
        showAlert('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1000);
      } else {
        showAlert('Please enter valid credentials', 'danger');
      }
    });
  }

  // Handle Signup
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('signupName').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;

      if (name && email && password.length >= 6) {
        // Store user info
        localStorage.setItem('user', JSON.stringify({ email, name }));
        localStorage.setItem('isLoggedIn', 'true');

        // Show success and redirect
        showAlert('Account created! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1000);
      } else {
        showAlert('Please fill all fields correctly (password min 6 chars)', 'danger');
      }
    });
  }

  // Helper function to show alerts
  function showAlert (message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }

  // Set today's date as default for date inputs
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split('T')[0];
  dateInputs.forEach(input => {
    if (!input.value) input.value = today;
  });
});
