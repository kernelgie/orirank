// Function to apply the theme based on the state
const applyTheme = (isDark) => {
  if (isDark) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  // Update icon if it exists on the current page
  const toggleButton = document.getElementById('darkModeToggle');
  const toggleIcon = toggleButton ? toggleButton.querySelector('.toggle-icon') : null;
  if (toggleIcon) {
    toggleIcon.textContent = isDark ? '☀️' : '🌙';
  }
};

// 1. Listen for changes in OTHER tabs
window.addEventListener('storage', (event) => {
  if (event.key === 'orirank_dark_mode') {
    const isDark = event.newValue === 'true';
    applyTheme(isDark);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('darkModeToggle');

  // 2. Initial Load: Check storage immediately
  const savedMode = localStorage.getItem('orirank_dark_mode') === 'true';
  applyTheme(savedMode);

  // 3. Handle Button Click
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      // Toggle the class locally
      const isNowDark = document.body.classList.toggle('dark-mode');

      // Save to storage (this triggers the 'storage' event in OTHER tabs)
      localStorage.setItem('orirank_dark_mode', isNowDark);

      // Update the icon locally
      applyTheme(isNowDark);
    });
  }

  // Load chart only on ranking pages
  if (typeof rankings !== 'undefined' && typeof currentWeek !== 'undefined') {
    document.getElementById('week-info').textContent = `Week of ${currentWeek}`;
    createChart(rankings);
  }
});