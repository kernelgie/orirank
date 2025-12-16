// js/main.js - full updated version

document.addEventListener('DOMContentLoaded', () => {
  // Load rankings data
  if (typeof rankings === 'undefined' || typeof currentWeek === 'undefined') {
    document.getElementById('week-info').textContent = 'Error loading data';
    return;
  }

  document.getElementById('week-info').textContent = `Week of ${currentWeek}`;

  // Create chart
  createChart(rankings);

  // Dark Mode Toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  const toggleIcon = darkModeToggle.querySelector('.toggle-icon');

  // Load saved preference
  const savedDarkMode = localStorage.getItem('orirank_dark_mode') === 'true';
  if (savedDarkMode) {
    document.body.classList.add('dark-mode');
    toggleIcon.textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    toggleIcon.textContent = '🌙';
  }

  darkModeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('orirank_dark_mode', isDark);
    toggleIcon.textContent = isDark ? '☀️' : '🌙';
  });

  // View Toggle - Nice View default
  const niceViewBtns = document.querySelectorAll('#niceViewBtn');
  const graphViewBtns = document.querySelectorAll('#graphViewBtn');
  const niceView = document.getElementById('niceView');
  const graphView = document.getElementById('graphView');

  // Show Nice View by default
  graphView.style.display = 'none';
  niceView.style.display = 'block';

  // Add listeners to all buttons (there are two sets - one in each view)
  niceViewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      niceView.style.display = 'block';
      graphView.style.display = 'none';
      niceViewBtns.forEach(b => b.classList.add('active'));
      graphViewBtns.forEach(b => b.classList.remove('active'));
      renderNiceView(rankings);
    });
  });

  graphViewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      niceView.style.display = 'none';
      graphView.style.display = 'block';
      niceViewBtns.forEach(b => b.classList.remove('active'));
      graphViewBtns.forEach(b => b.classList.add('active'));
    });
  });

  // Initial render of Nice View
  renderNiceView(rankings);
});

// Render Nice View with Top 3 Spotlight + horizontal #4-10
function renderNiceView(rankings) {
  const top10 = rankings.slice(0, 10);
  const spotlight = document.querySelector('.top3-spotlight');
  const grid = document.querySelector('.nice-rankings-grid');

  if (!spotlight || !grid) return;

  spotlight.innerHTML = '';
  grid.innerHTML = '';

  top10.forEach((item, index) => {
    const isTop3 = index < 3;
    const container = isTop3 ? spotlight : grid;

    const card = document.createElement('div');
    card.className = isTop3 ? 'top3-card' : 'nice-card';

    const coverUrl = item.cover || 'https://via.placeholder.com/300x420/e0e0e0/aaaaaa?text=No+Cover';
    const amazonUrl = item.amazonLink || '#';

    card.innerHTML = `
      <img src="${coverUrl}" alt="${item.title}" class="${isTop3 ? 'top3-image' : 'nice-card-image'}" onerror="this.src='https://via.placeholder.com/300x420/e0e0e0/aaaaaa?text=No+Cover'">
      <div class="${isTop3 ? 'top3-info' : 'nice-card-info'}">
        <div class="${isTop3 ? 'top3-rank' : 'nice-card-rank'}">#${item.rank}</div>
        <div class="${isTop3 ? 'top3-title' : 'nice-card-title'}">${item.title}</div>
        <div class="${isTop3 ? 'top3-sales' : 'nice-card-sales'}">Weekly: <strong>${item.weeklySales.toLocaleString()}</strong> copies</div>
        ${item.cumulative ? `<div class="${isTop3 ? 'top3-sales' : 'nice-card-sales'}">Cumulative: <strong>${item.cumulative.toLocaleString()}</strong></div>` : ''}
        <a href="${amazonUrl}" target="_blank" class="${isTop3 ? 'top3-amazon' : 'amazon-btn'}">Buy on Amazon →</a>
      </div>
    `;

    container.appendChild(card);
  });
}