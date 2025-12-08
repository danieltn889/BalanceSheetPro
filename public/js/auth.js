// JWT-based authentication handler
/* global localStorage */

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  // Check if user is already logged in
  const token = localStorage.getItem('token');
  if (token && window.location.pathname === '/') {
    window.location.href = '/dashboard.html';
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;

      if (!username || !password) {
        showAlert('Please enter username and password', 'danger');
        return;
      }

      try {
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          showAlert('Login successful! Redirecting...', 'success');
          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 1000);
        } else {
          showAlert(data.error || 'Login failed', 'danger');
        }
      } catch (error) {
        showAlert('Network error. Please try again.', 'danger');
      }
    });
  }

  // Handle Signup
  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const username = document.getElementById('signupUsername').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;

      if (!username || !email || !password) {
        showAlert('Please fill all fields', 'danger');
        return;
      }

      if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'danger');
        return;
      }

      try {
        const response = await fetch('/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          showAlert('Account created! Redirecting...', 'success');
          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 1000);
        } else {
          showAlert(data.error || 'Registration failed', 'danger');
        }
      } catch (error) {
        showAlert('Network error. Please try again.', 'danger');
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

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// Get auth headers for API calls
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}
