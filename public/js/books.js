// public/js/books.js
// Handles book search

document.addEventListener('DOMContentLoaded', () => {
  console.log("📖 Books.js loaded");

  const searchForm = document.querySelector('form[action="/"]');
  const searchInput = document.getElementById('searchInput');

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', e => {
      const q = searchInput.value.trim();
      if (!q) {
        e.preventDefault();
        alert('Please enter a search term.');
      }
    });
  }
});
