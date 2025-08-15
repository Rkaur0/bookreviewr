// public/js/app.js
// Handles app-wide UI events like logout

document.addEventListener('DOMContentLoaded', () => {
  console.log("📚 App.js loaded");

  // Handle logout link click
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', async e => {
      e.preventDefault();
      try {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
          window.location.href = '/';
        } else {
          console.error('Logout failed');
        }
      } catch (err) {
        console.error('Logout error:', err);
      }
    });
  }
});
