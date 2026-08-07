// ===========================
//  verify.js — OTP Box Logic
//  Handles: auto-jump, backspace, paste, validation
// ===========================

var otpInputs = document.querySelectorAll('.otp-input');

// Auto-jump to next box when a digit is typed
otpInputs.forEach(function(input, index) {

  input.addEventListener('input', function() {
    // Only allow single digit numbers
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);

    if (input.value !== '') {
      input.classList.add('filled');
      // Move to next box
      if (index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    } else {
      input.classList.remove('filled');
    }
  });

  // Backspace goes back to previous box
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Backspace' && input.value === '' && index > 0) {
      otpInputs[index - 1].focus();
      otpInputs[index - 1].value = '';
      otpInputs[index - 1].classList.remove('filled');
    }
  });

});

// Paste support — spreads digits across boxes
otpInputs[0].addEventListener('paste', function(e) {
  e.preventDefault();
  var pasted = (e.clipboardData || window.clipboardData).getData('text');
  var digits = pasted.replace(/[^0-9]/g, '').split('');

  digits.forEach(function(digit, i) {
    if (otpInputs[i]) {
      otpInputs[i].value = digit;
      otpInputs[i].classList.add('filled');
    }
  });

  // Focus last filled box
  var lastIndex = Math.min(digits.length, otpInputs.length) - 1;
  if (lastIndex >= 0) otpInputs[lastIndex].focus();
});


// ---- Form Submit ----
var verifyForm = document.getElementById('verifyForm');

if (verifyForm) {
  verifyForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var code = '';
    var allFilled = true;

    otpInputs.forEach(function(input) {
      code += input.value;
      if (input.value === '') allFilled = false;
    });

    var errorEl = document.getElementById('otp-error');

    if (!allFilled) {
      errorEl.textContent = 'Please enter all 6 digits.';
      otpInputs.forEach(function(input) {
        if (input.value === '') input.classList.add('error');
      });
      return;
    }

    // Clear errors
    errorEl.textContent = '';
    otpInputs.forEach(function(input) {
      input.classList.remove('error');
    });

    console.log('OTP submitted:', code);
    // TODO: Send code to your backend for verification
    // window.location.href = 'dashboard.html';
  });
}


// ---- Resend Code ----
var resendBtn = document.getElementById('resendBtn');

if (resendBtn) {
  resendBtn.addEventListener('click', function(e) {
    e.preventDefault();

    // Clear all boxes
    otpInputs.forEach(function(input) {
      input.value = '';
      input.classList.remove('filled', 'error');
    });
    otpInputs[0].focus();

    console.log('Resend code clicked');
    // TODO: Call your resend API here
  });
}
