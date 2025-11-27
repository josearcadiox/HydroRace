const API_BASE_URL = '';
const USE_MOCK_DATA = true;

let chart;
let refreshInterval;

const mockData = [
  { deviceId: 'baby_01', decibels: 45, timestamp: new Date(Date.now() - 500000).toISOString() },
  { deviceId: 'baby_01', decibels: 52, timestamp: new Date(Date.now() - 400000).toISOString() },
  { deviceId: 'baby_01', decibels: 48, timestamp: new Date(Date.now() - 300000).toISOString() },
  { deviceId: 'baby_01', decibels: 65, timestamp: new Date(Date.now() - 200000).toISOString() },
  { deviceId: 'baby_01', decibels: 75, timestamp: new Date(Date.now() - 100000).toISOString() },
  { deviceId: 'baby_01', decibels: 82, timestamp: new Date(Date.now() - 50000).toISOString() },
  { deviceId: 'baby_01', decibels: 78, timestamp: new Date(Date.now() - 30000).toISOString() },
  { deviceId: 'baby_01', decibels: 55, timestamp: new Date(Date.now() - 10000).toISOString() }
];

async function getData() {
  if (USE_MOCK_DATA) {
    return { success: true, count: mockData.length, data: mockData };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/GetNoiseHistory?limit=50`);
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return { success: false, data: [] };
  }
}

function updateIndicator(reading) {
  const indicator = document.getElementById('alertIndicator');
  const decibelValue = document.getElementById('currentDecibels');
  const status = document.getElementById('statusText');
  const device = document.getElementById('deviceId');
  const lastTime = document.getElementById('lastUpdate');

  if (!reading) {
    decibelValue.textContent = '--';
    status.textContent = 'No hay datos';
    indicator.className = 'alert-indicator';
    return;
  }

  const db = reading.decibels;
  decibelValue.textContent = db.toFixed(1);
  device.textContent = reading.deviceId;
  lastTime.textContent = new Date(reading.timestamp).toLocaleString('es-ES');

  indicator.classList.remove('normal', 'warning', 'danger');

  if (db > 70) {
    indicator.classList.add('danger');
    status.textContent = '⚠️ ALERTA: Ruido Alto';
  } else if (db > 60) {
    indicator.classList.add('warning');
    status.textContent = '⚡ Precaución';
  } else {
    indicator.classList.add('normal');
    status.textContent = '✅ Todo Tranquilo';
  }
}

function createChart() {
  const ctx = document.getElementById('noiseChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Nivel de Ruido (dB)',
        data: [],
        borderColor: '#4a90e2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

function updateChart(data) {
  if (!data || data.length === 0) return;

  const labels = data.map(item => {
    return new Date(item.timestamp).toLocaleTimeString('es-ES');
  });

  const values = data.map(item => item.decibels);

  const colors = values.map(val => {
    if (val > 70) return '#e74c3c';
    if (val > 60) return '#f39c12';
    return '#2ecc71';
  });

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.data.datasets[0].pointBackgroundColor = colors;
  chart.update();
}

async function refresh() {
  const result = await getData();
  
  if (result.success && result.data.length > 0) {
    updateChart(result.data);
    updateIndicator(result.data[result.data.length - 1]);
    document.getElementById('totalRecords').textContent = result.count;
  }
}

document.getElementById('refreshBtn').addEventListener('click', refresh);

document.addEventListener('DOMContentLoaded', async () => {
  createChart();
  await refresh();
  refreshInterval = setInterval(refresh, 10000);
});

window.addEventListener('beforeunload', () => {
  if (refreshInterval) clearInterval(refreshInterval);
});
