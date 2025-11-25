const API_BASE_URL = 'CONFIGURE_AZURE_FUNCTION_URL';

const USE_MOCK_DATA = true;

let noiseChart;
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

async function fetchNoiseHistory() {
  try {
    if (USE_MOCK_DATA) {
      return {
        success: true,
        count: mockData.length,
        data: mockData
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/GetNoiseHistory?limit=50`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching noise history:', error);
    return { success: false, data: [] };
  }
}

function updateAlertIndicator(latestReading) {
  const indicator = document.getElementById('alertIndicator');
  const currentDecibels = document.getElementById('currentDecibels');
  const statusText = document.getElementById('statusText');
  const deviceId = document.getElementById('deviceId');
  const lastUpdate = document.getElementById('lastUpdate');

  if (!latestReading) {
    currentDecibels.textContent = '--';
    statusText.textContent = 'No hay datos disponibles';
    indicator.className = 'alert-indicator';
    return;
  }

  const decibels = latestReading.decibels;
  currentDecibels.textContent = decibels.toFixed(1);
  deviceId.textContent = latestReading.deviceId;
  
  const date = new Date(latestReading.timestamp);
  lastUpdate.textContent = date.toLocaleString('es-ES');

  indicator.classList.remove('normal', 'warning', 'danger');

  if (decibels > 70) {
    indicator.classList.add('danger');
    statusText.textContent = '⚠️ ALERTA: Ruido Alto Detectado';
  } else if (decibels > 60) {
    indicator.classList.add('warning');
    statusText.textContent = '⚡ Precaución: Ruido Moderado';
  } else {
    indicator.classList.add('normal');
    statusText.textContent = '✅ Todo Tranquilo';
  }
}

function initChart() {
  const ctx = document.getElementById('noiseChart').getContext('2d');
  
  noiseChart = new Chart(ctx, {
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
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#4a90e2',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: { size: 14 },
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 14 },
          bodyFont: { size: 13 },
          callbacks: {
            label: function(context) {
              return `Ruido: ${context.parsed.y} dB`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: function(value) {
              return value + ' dB';
            },
            font: { size: 12 }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            font: { size: 11 }
          }
        }
      },
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      }
    }
  });
}

function updateChart(data) {
  if (!data || data.length === 0) return;

  const labels = data.map(item => {
    const date = new Date(item.timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  });

  const values = data.map(item => item.decibels);

  const backgroundColors = values.map(value => {
    if (value > 70) return 'rgba(231, 76, 60, 0.2)';
    if (value > 60) return 'rgba(243, 156, 18, 0.2)';
    return 'rgba(46, 204, 113, 0.2)';
  });

  const borderColors = values.map(value => {
    if (value > 70) return '#e74c3c';
    if (value > 60) return '#f39c12';
    return '#2ecc71';
  });

  noiseChart.data.labels = labels;
  noiseChart.data.datasets[0].data = values;
  noiseChart.data.datasets[0].backgroundColor = backgroundColors;
  noiseChart.data.datasets[0].borderColor = borderColors[borderColors.length - 1];
  noiseChart.data.datasets[0].pointBackgroundColor = borderColors;
  
  noiseChart.update();
}

async function refreshData() {
  console.log('Refreshing data...');
  
  const result = await fetchNoiseHistory();
  
  if (result.success && result.data.length > 0) {
    updateChart(result.data);
    updateAlertIndicator(result.data[result.data.length - 1]);
    document.getElementById('totalRecords').textContent = result.count;
  } else {
    console.warn('No data available');
  }
}

document.getElementById('refreshBtn').addEventListener('click', refreshData);

document.addEventListener('DOMContentLoaded', async () => {
  initChart();
  await refreshData();
  
  refreshInterval = setInterval(refreshData, 10000);
});

window.addEventListener('beforeunload', () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

