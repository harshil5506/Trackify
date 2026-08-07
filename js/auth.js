// ===========================
//  auth.js — Trackify Auth Logic
//  Handles: password toggle, form validation
// ===========================


// ---- Toggle Password Visibility ----
// Finds all eye buttons and toggles input type between password/text

document.querySelectorAll('.eye-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var targetId = btn.getAttribute('data-target');
    var input = document.getElementById(targetId);

    if (input.type === 'password') {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  });
});


// ---- Helper: Show error under a field ----
function showError(fieldId, message) {
  var input = document.getElementById(fieldId);
  var error = document.getElementById(fieldId + '-error');

  if (input) input.classList.add('error');
  if (error) error.textContent = message;
}

// ---- Helper: Clear error under a field ----
function clearError(fieldId) {
  var input = document.getElementById(fieldId);
  var error = document.getElementById(fieldId + '-error');

  if (input) input.classList.remove('error');
  if (error) error.textContent = '';
}

// ---- Helper: Basic email format check ----
function isValidEmail(email) {
  return email.includes('@') && email.includes('.');
}


// ---- Sign Up Form Validation ----
var signupForm = document.getElementById('signupForm');

if (signupForm) {
  signupForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var fullname = document.getElementById('fullname').value.trim();
    var email    = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var confirm  = document.getElementById('confirm-password').value;
    var terms    = document.getElementById('terms').checked;

    var hasError = false;

    // Clear previous errors
    clearError('fullname');
    clearError('email');
    clearError('password');
    clearError('confirm-password');

    // Validate full name
    if (fullname === '') {
      showError('fullname', 'Full name is required.');
      hasError = true;
    }

    // Validate email
    if (email === '') {
      showError('email', 'Email address is required.');
      hasError = true;
    } else if (!isValidEmail(email)) {
      showError('email', 'Please enter a valid email address.');
      hasError = true;
    }

    // Validate password
    if (password === '') {
      showError('password', 'Password is required.');
      hasError = true;
    } else if (password.length < 8) {
      showError('password', 'Password must be at least 8 characters.');
      hasError = true;
    }

    // Validate confirm password
    if (confirm === '') {
      showError('confirm-password', 'Please confirm your password.');
      hasError = true;
    } else if (confirm !== password) {
      showError('confirm-password', 'Passwords do not match.');
      hasError = true;
    }

    // Terms checkbox
    if (!terms) {
      alert('Please agree to the Terms & Conditions to continue.');
      hasError = true;
    }

    // If no errors — submit (replace this with your actual submission logic)
    if (!hasError) {
      console.log('Sign Up submitted:', { fullname, email });
      // Example: redirect to dashboard or call your API here
      // window.location.href = 'dashboard.html';
    }
  });
}


// ---- Sign In Form Validation ----
var signinForm = document.getElementById('signinForm');

if (signinForm) {
  signinForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var email    = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;

    var hasError = false;

    clearError('email');
    clearError('password');

    // Validate email
    if (email === '') {
      showError('email', 'Email address is required.');
      hasError = true;
    } else if (!isValidEmail(email)) {
      showError('email', 'Please enter a valid email address.');
      hasError = true;
    }

    // Validate password
    if (password === '') {
      showError('password', 'Password is required.');
      hasError = true;
    }

    // If no errors — submit
    if (!hasError) {
      console.log('Sign In submitted:', { email });
      // Example: redirect to dashboard or call your API here
       window.location.href = 'verify.html';
    }
  });
}


// ---- Social Button Placeholders ----
// Hook up Google / GitHub buttons when ready

var googleBtn = document.getElementById('googleBtn');
var githubBtn = document.getElementById('githubBtn');

if (googleBtn) {
  googleBtn.addEventListener('click', function() {
    // TODO: Add Google OAuth logic here
    console.log('Google sign in clicked');
  });
}

if (githubBtn) {
  githubBtn.addEventListener('click', function() {
    // TODO: Add GitHub OAuth logic here
    console.log('GitHub sign in clicked');
  });
}