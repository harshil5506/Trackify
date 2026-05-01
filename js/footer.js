// ===========================
//  footer.js
//  Automatically injects the footer into any page.
//  Usage: Add this ONE line before </body> on any page:
//  <script src="footer.js"></script>
// ===========================

var footerHTML = `
<footer class="site-footer">
  <div class="footer-top">

    <!-- Brand -->
    <div class="footer-brand">
      <div class="footer-logo">
        <img src="your-logo.png" alt="Trackify Logo" class="logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"/>
        <div class="logo-fallback">T</div>
        <span class="brand-name">Trackify</span>
      </div>
      <p class="footer-desc">Powerful project tracking and analytics platform designed to help teams collaborate efficiently and achieve their goals faster.</p>
      <div class="footer-socials">
        <a href="#" class="social-icon" aria-label="Facebook">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a href="#" class="social-icon" aria-label="LinkedIn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
        <a href="#" class="social-icon" aria-label="Twitter">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.7 5.5 4.4 9 4.5-.2-2 1-3.9 3-4.4C17 4.5 19.5 5 21 6.5L22 4z"/></svg>
        </a>
        <a href="#" class="social-icon" aria-label="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        </a>
      </div>
    </div>

    <!-- Company Links -->
    <div class="footer-col">
      <h4 class="footer-col-title">Company</h4>
      <ul class="footer-links">
        <li><a href="#">About Us</a></li>
        <li><a href="#">Partners</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </div>

    <!-- Contact Info -->
    <div class="footer-col">
      <h4 class="footer-col-title">Contact Information</h4>
      <ul class="footer-contact">
        <li>
          <span class="contact-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
          <span>123 Business Avenue<br/>San Francisco, CA 94102<br/>United States</span>
        </li>
        <li>
          <span class="contact-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/></svg></span>
          <span>+1 (555) 123-4567<br/>Mon-Fri 9AM-6PM PST</span>
        </li>
        <li>
          <span class="contact-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
          <span>support@trackify.com<br/>sales@trackify.com</span>
        </li>
      </ul>
    </div>

  </div>

  <div class="footer-bottom">
    <div class="footer-legal">
      <a href="#">Privacy Policy</a>
      <a href="#">Terms of Service</a>
      <a href="#">Cookie Policy</a>
      <a href="#">Accessibility</a>
    </div>
    <p class="footer-copy">&copy; 2026 Trackify Inc. All rights reserved.</p>
  </div>
</footer>
`;

// Inject footer CSS if not already loaded
var cssAlreadyLoaded = document.querySelector('link[href="css/footer.css"]');
if (!cssAlreadyLoaded) {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/footer.css';
  document.head.appendChild(link);
}

// Inject footer HTML at end of body
document.body.insertAdjacentHTML('beforeend', footerHTML);