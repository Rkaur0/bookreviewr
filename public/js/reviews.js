// public/js/reviews.js
// Handles create/update review form submission

document.addEventListener('DOMContentLoaded', () => {
  console.log("✏️ Reviews.js loaded");

  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async e => {
      e.preventDefault();

      const formData = new FormData(reviewForm);
      const payload = Object.fromEntries(formData.entries());

      // Convert checkbox to integer 1 or 0
      payload.contains_spoilers = formData.get('contains_spoilers') ? 1 : 0;

      const method = payload.id ? 'PUT' : 'POST';
      const url = payload.id ? `/api/reviews/${payload.id}` : '/api/reviews';

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          window.location.href = `/book/${payload.book_id}`;
        } else {
          const errData = await res.json();
          alert(errData.error || 'Error saving review');
        }
      } catch (err) {
        console.error('Error saving review:', err);
        alert('An error occurred while saving the review.');
      }
    });
  }
});
