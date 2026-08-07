// ===========================
//  forgot-password.js
//  Handles: email validation + redirect to verify page
// ===========================

var forgotForm = document.getElementById('forgotForm');

if (forgotForm) {
  forgotForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var email   = document.getElementById('email').value.trim();
    var errorEl = document.getElementById('email-error');
    var emailInput = document.getElementById('email');

    // Clear previous error
    errorEl.textContent = '';
    emailInput.classList.remove('error');

    // Validate
    if (email === '') {
      errorEl.textContent = 'Email address is required.';
      emailInput.classList.add('error');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      errorEl.textContent = 'Please enter a valid email address.';
      emailInput.classList.add('error');
      return;
    }

    // All good — redirect to verify page
    console.log('Reset code sent to:', email);
    // TODO: Call your API to send the reset code here
    window.location.href = 'verify.html';
  });
}