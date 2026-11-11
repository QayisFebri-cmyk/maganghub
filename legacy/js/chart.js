const ChartManager = {
  charts: {},
  defaultOptions(isDark) {
    const tc = isDark ? '#CBD5E1' : '#1F2937';
    const gc = isDark ? '#2D333B' : '#E5E7EB';
    return { responsive: true, maintainAspectRatio: true, plugins: { legend: { labels: { color: tc, font: { family: "'Inter', sans-serif", size: 12 } } } }, scales: { y: { beginAtZero: true, ticks: { color: tc, font: { family: "'Inter', sans-serif" } }, grid: { color: gc } }, x: { ticks: { color: tc, font: { family: "'Inter', sans-serif" } }, grid: { display: false } } } };
  },
  bar(id, labels, data, label, colors) {
    const ctx = document.getElementById(id)?.getContext('2d');
    if (!ctx) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (this.charts[id]) this.charts[id].destroy();
    this.charts[id] = new Chart(ctx, { type: 'bar', data: { labels, datasets: [{ label, data, backgroundColor: colors || '#2F3BFF', borderRadius: 6, borderSkipped: false }] }, options: this.defaultOptions(isDark) });
  },
  doughnut(id, labels, data, colors) {
    const ctx = document.getElementById(id)?.getContext('2d');
    if (!ctx) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (this.charts[id]) this.charts[id].destroy();
    this.charts[id] = new Chart(ctx, { type: 'doughnut', data: { labels, datasets: [{ data, backgroundColor: colors || ['#2F3BFF', '#28A745', '#F59E0B', '#DC3545', '#5B3DF5'], borderWidth: 0 }] }, options: { ...this.defaultOptions(isDark), cutout: '65%' } });
  },
  line(id, labels, datasets) {
    const ctx = document.getElementById(id)?.getContext('2d');
    if (!ctx) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (this.charts[id]) this.charts[id].destroy();
    this.charts[id] = new Chart(ctx, { type: 'line', data: { labels, datasets }, options: { ...this.defaultOptions(isDark), elements: { line: { tension: 0.4 } } } });
  }
};
