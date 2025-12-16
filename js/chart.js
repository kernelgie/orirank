function createChart(rankings) {
  const ctx = document.getElementById('salesChart').getContext('2d');

  if (window.myChart) {
    window.myChart.destroy();
  }

  const top10 = rankings.slice(0, 10);

  // Podium colors
  const barColors = top10.map((item, index) => {
    if (index === 0) return '#FFD700'; // Gold
    if (index === 1) return '#C0C0C0'; // Silver
    if (index === 2) return '#CD7F32'; // Bronze
    return '#3498db';
  });

  // Crown for #1, medals for #2 and #3
  const medalLabels = top10.map((item, index) => {
    if (index === 0) return '👑';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '';
  });

  // Detect Light Novel page for Y-axis scale
  const isLightNovelPage = window.location.pathname.includes('light-novels.html');
  const yMax = isLightNovelPage ? 50000 : 200000;
  const yStepSize = isLightNovelPage ? 10000 : 40000;

  // External tooltip element - fixed size and style
  let tooltipEl = document.querySelector('.tooltip-external');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip-external';
    Object.assign(tooltipEl.style, {
      background: 'rgba(15, 23, 42, 0.95)',
      borderRadius: '16px',
      color: 'white',
      opacity: 0,
      pointerEvents: 'none',
      position: 'absolute',
      padding: '16px',
      transition: 'opacity .3s ease',
      zIndex: 1000,
      width: '340px',
      boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
      fontFamily: 'inherit',
    });
    document.querySelector('.chart-section').appendChild(tooltipEl);
  }

  let isTooltipHovered = false;
  let hideTimeout = null;

  // Mouse enter tooltip - keep open
  tooltipEl.addEventListener('mouseenter', () => {
    isTooltipHovered = true;
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = 'auto';
    if (hideTimeout) clearTimeout(hideTimeout);
  });

  // Mouse leave tooltip - delay hide
  tooltipEl.addEventListener('mouseleave', () => {
    isTooltipHovered = false;
    hideTimeout = setTimeout(() => {
      tooltipEl.style.opacity = 0;
      tooltipEl.style.pointerEvents = 'none';
    }, 800); // 800ms - plenty of time to click Amazon button
  });

  const externalTooltipHandler = (context) => {
    const { chart, tooltip } = context;

    if (hideTimeout) clearTimeout(hideTimeout);

    if (tooltip.opacity === 0) {
      if (!isTooltipHovered) {
        hideTimeout = setTimeout(() => {
          tooltipEl.style.opacity = 0;
          tooltipEl.style.pointerEvents = 'none';
        }, 800);
      }
      return;
    }

    const dataIndex = tooltip.dataPoints[0].dataIndex;
    const item = top10[dataIndex];

    const coverUrl = item.cover || 'https://via.placeholder.com/220x310/e0e0e0/aaaaaa?text=No+Cover';
    const amazonUrl = item.amazonLink || '#';

    tooltipEl.innerHTML = `
      <div style="display:flex; gap:16px; align-items:flex-start;">
        <img src="${coverUrl}" style="width:90px; height:126px; object-fit:cover; border-radius:12px;" onerror="this.style.display='none'">
        <div style="flex:1;">
          <div style="font-weight:700; font-size:1.25em; line-height:1.3; margin-bottom:6px;">#${item.rank} ${item.title}</div>
          <div style="opacity:0.85; font-size:0.95em; margin-bottom:10px;">by ${item.author || '—'}</div>
          <div style="font-size:1.15em; margin-bottom:12px;"><strong>${item.weeklySales.toLocaleString()}</strong> copies</div>
          ${item.cumulative ? `<div style="font-size:0.9em; opacity:0.8; margin-bottom:12px;">Cumulative: ${item.cumulative.toLocaleString()}</div>` : ''}
          <a href="${amazonUrl}" target="_blank" style="display:inline-block; background:#f97316; color:white; padding:9px 16px; border-radius:8px; text-decoration:none; font-weight:600; font-size:0.95em;">Buy on Amazon →</a>
        </div>
      </div>
    `;

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

    const bar = chart.getDatasetMeta(0).data[dataIndex];
    const barTop = bar.y;

    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = 'auto';
    tooltipEl.style.left = (positionX + tooltip.caretX) + 'px';
    tooltipEl.style.top = (positionY + barTop - tooltipEl.offsetHeight - 20) + 'px';
    tooltipEl.style.transform = 'translateX(-50%)';
  };

  const clickHandler = (event) => {
    const points = window.myChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
    if (points.length) {
      const index = points[0].index;
      const item = top10[index];
      const amazonUrl = item.amazonLink || '#';
      if (amazonUrl !== '#') {
        window.open(amazonUrl, '_blank');
      }
    }
  };

  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top10.map(item => item.title.length > 22 ? item.title.substring(0, 19) + '...' : item.title),
      datasets: [{
        data: top10.map(item => item.weeklySales),
        backgroundColor: barColors,
        borderRadius: 20,
        borderSkipped: false,
        barThickness: 70,
        maxBarThickness: 90,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 2000, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Top 10 Weekly Sales', font: { size: 26, weight: 'bold' }, color: '#2c3e50', padding: { top: 20, bottom: 40 } },
        tooltip: { enabled: false, external: externalTooltipHandler },
        datalabels: {
          anchor: 'end',
          align: 'top',
          font: { size: 42, weight: 'bold' },
          color: '#fff',
          textStrokeColor: '#000',
          textStrokeWidth: 4,
          formatter: (value, context) => medalLabels[context.dataIndex]
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: yMax, // 50000 for Light Novels, 200000 for Manga
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { stepSize: yStepSize, callback: value => value.toLocaleString() }
        },
        x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 45 } }
      },
      onClick: clickHandler
    },
    plugins: [ChartDataLabels]
  });
}