// ========================================
// Configuración - Cargada desde config.js
// ========================================

// Cargar configuración desde config.js o usar valores por defecto
const API_BASE_URL =
  window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL !== undefined
    ? window.APP_CONFIG.API_BASE_URL
    : ''; // Por defecto, URL relativa

const USE_MOCK_DATA =
  window.APP_CONFIG && window.APP_CONFIG.USE_MOCK_DATA !== undefined
    ? window.APP_CONFIG.USE_MOCK_DATA
    : false;

const REFRESH_INTERVAL =
  window.APP_CONFIG && window.APP_CONFIG.REFRESH_INTERVAL !== undefined
    ? window.APP_CONFIG.REFRESH_INTERVAL
    : 10000; // 10 segundos por defecto

// Log de configuración
if (window.APP_CONFIG && window.APP_CONFIG.DEBUG) {
  console.log('📡 API Base URL:', API_BASE_URL || '(URL relativa)');
  console.log('🔄 Refresh Interval:', REFRESH_INTERVAL, 'ms');
}

let chart;
let refreshInterval;

const mockData = [
  {
    deviceId: 'baby_01',
    decibels: 45,
    timestamp: new Date(Date.now() - 500000).toISOString(),
  },
  {
    deviceId: 'baby_01',
    decibels: 52,
    timestamp: new Date(Date.now() - 400000).toISOString(),
  },
  {
    deviceId: 'baby_01',
    decibels: 48,
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    deviceId: 'baby_01',
    decibels: 65,
    timestamp: new Date(Date.now() - 200000).toISOString(),
  },
  {
    deviceId: 'baby_01',
    decibels: 75,
    timestamp: new Date(Date.now() - 100000).toISOString(),
  },
  {
    deviceId: 'baby_01',
    decibels: 82,
    timestamp: new Date(Date.now() - 50000).toISOString(),
  },
  {
    deviceId: 'baby_01',
    decibels: 78,
    timestamp: new Date(Date.now() - 30000).toISOString(),
  },
  {
    deviceId: 'baby_01',
    decibels: 55,
    timestamp: new Date(Date.now() - 10000).toISOString(),
  },
];

async function getData() {
  if (USE_MOCK_DATA) {
    return { success: true, count: mockData.length, data: mockData };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/GetNoiseHistory?limit=50`
    );
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
      datasets: [
        {
          label: 'Nivel de Ruido (dB)',
          data: [],
          borderColor: '#4a90e2',
          backgroundColor: 'rgba(74, 144, 226, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  });
}

function updateChart(data) {
  if (!data || data.length === 0) return;

  const labels = data.map((item) => {
    return new Date(item.timestamp).toLocaleTimeString('es-ES');
  });

  const values = data.map((item) => item.decibels);

  const colors = values.map((val) => {
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
    // Ordenar por timestamp para asegurar que el último es el más reciente
    const sortedData = [...result.data].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    updateChart(sortedData);
    // Usar el último elemento (más reciente)
    const latestReading = sortedData[sortedData.length - 1];
    updateIndicator(latestReading);
    document.getElementById('totalRecords').textContent =
      result.count || sortedData.length;
  } else if (result.success) {
    // Si no hay datos, limpiar indicadores
    updateIndicator(null);
    document.getElementById('totalRecords').textContent = '0';
  }
}

document.getElementById('refreshBtn').addEventListener('click', refresh);

document.addEventListener('DOMContentLoaded', async () => {
  createChart();
  await refresh();
  refreshInterval = setInterval(refresh, REFRESH_INTERVAL);
});

window.addEventListener('beforeunload', () => {
  if (refreshInterval) clearInterval(refreshInterval);
});

// ========================================
// Control Panel Functions
// ========================================

// Send Data Form
document
  .getElementById('sendDataForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();

    const deviceId = document.getElementById('deviceIdInput').value;
    const decibels = parseFloat(document.getElementById('decibelsInput').value);
    const statusEl = document.getElementById('sendStatus');

    try {
      statusEl.className = 'status-message show info';
      statusEl.textContent = '📤 Enviando datos...';

      const response = await fetch(`${API_BASE_URL}/api/ReceiveNoiseData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          decibels,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar datos');
      }

      const data = await response.json();

      if (data.success) {
        statusEl.className = 'status-message show success';
        statusEl.textContent = `✅ Dato enviado exitosamente: ${decibels} dB`;

        // Actualizar inmediatamente con el dato enviado
        const newReading = {
          deviceId: deviceId,
          decibels: decibels,
          timestamp: new Date().toISOString(),
        };
        updateIndicator(newReading);

        // Esperar 2 segundos y refrescar todos los datos
        setTimeout(async () => {
          await refresh();
        }, 2000);

        setTimeout(() => {
          statusEl.className = 'status-message';
        }, 4000);
      }
    } catch (error) {
      statusEl.className = 'status-message show error';
      statusEl.textContent = `❌ Error: ${error.message}`;
    }
  });

// Delete Old Data
document.getElementById('deleteOldBtn').addEventListener('click', async () => {
  const days = document.getElementById('daysInput').value;
  const statusEl = document.getElementById('deleteStatus');

  if (
    !confirm(
      `¿Estás seguro de eliminar todos los datos más antiguos que ${days} días?`
    )
  ) {
    return;
  }

  try {
    statusEl.className = 'status-message show info';
    statusEl.textContent = '🔍 Verificando datos a eliminar...';

    const dryRunResponse = await fetch(
      `${API_BASE_URL}/api/DeleteOldData?days=${days}&dryRun=true`,
      {
        method: 'DELETE',
      }
    );

    const dryRunData = await dryRunResponse.json();

    if (dryRunData.wouldDelete === 0) {
      statusEl.className = 'status-message show info';
      statusEl.textContent = `ℹ️ No hay datos más antiguos que ${days} días para eliminar.`;
      return;
    }

    if (
      !confirm(`Se eliminarán ${dryRunData.wouldDelete} registros. ¿Continuar?`)
    ) {
      statusEl.className = 'status-message';
      return;
    }

    statusEl.textContent = '🗑️ Eliminando datos...';

    const response = await fetch(
      `${API_BASE_URL}/api/DeleteOldData?days=${days}`,
      {
        method: 'DELETE',
      }
    );

    const data = await response.json();

    if (data.success) {
      statusEl.className = 'status-message show success';
      statusEl.textContent = `✅ ${data.deleted} registros eliminados exitosamente.`;

      setTimeout(() => {
        refresh();
      }, 1000);
    }
  } catch (error) {
    statusEl.className = 'status-message show error';
    statusEl.textContent = `❌ Error: ${error.message}`;
  }
});

// Delete Device Data
document
  .getElementById('deleteDeviceBtn')
  .addEventListener('click', async () => {
    const deviceId = document.getElementById('deleteDeviceInput').value;
    const statusEl = document.getElementById('deleteStatus');

    if (!deviceId) {
      alert('Por favor ingresa un ID de dispositivo');
      return;
    }

    if (
      !confirm(
        `⚠️ ¿Estás seguro de eliminar TODOS los datos del dispositivo "${deviceId}"?`
      )
    ) {
      return;
    }

    try {
      statusEl.className = 'status-message show info';
      statusEl.textContent = '🔍 Verificando datos a eliminar...';

      const dryRunResponse = await fetch(
        `${API_BASE_URL}/api/DeleteDeviceData?deviceId=${deviceId}&dryRun=true`,
        {
          method: 'DELETE',
        }
      );

      const dryRunData = await dryRunResponse.json();

      if (!dryRunData.success || dryRunData.wouldDelete === 0) {
        statusEl.className = 'status-message show info';
        statusEl.textContent = `ℹ️ No se encontraron datos para el dispositivo "${deviceId}".`;
        return;
      }

      if (
        !confirm(
          `Se eliminarán ${dryRunData.wouldDelete} registros del dispositivo "${deviceId}". ¿Continuar?`
        )
      ) {
        statusEl.className = 'status-message';
        return;
      }

      statusEl.textContent = '🗑️ Eliminando datos...';

      const response = await fetch(
        `${API_BASE_URL}/api/DeleteDeviceData?deviceId=${deviceId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        statusEl.className = 'status-message show success';
        statusEl.textContent = `✅ ${data.deleted} registros eliminados del dispositivo "${deviceId}".`;

        setTimeout(() => {
          refresh();
        }, 1000);
      }
    } catch (error) {
      statusEl.className = 'status-message show error';
      statusEl.textContent = `❌ Error: ${error.message}`;
    }
  });

// Get Device Stats
document.getElementById('getStatsBtn').addEventListener('click', async () => {
  const deviceId = document.getElementById('statsDeviceInput').value;
  const statsDisplayEl = document.getElementById('statsDisplay');

  if (!deviceId) {
    alert('Por favor ingresa un ID de dispositivo');
    return;
  }

  try {
    statsDisplayEl.innerHTML =
      '<p style="text-align: center; color: var(--text-secondary);">📊 Cargando estadísticas...</p>';
    statsDisplayEl.className = 'stats-display show';

    const response = await fetch(
      `${API_BASE_URL}/api/GetDeviceStats?deviceId=${deviceId}`
    );
    const data = await response.json();

    if (!data.success || !data.stats || data.stats.count === 0) {
      statsDisplayEl.innerHTML = `<p style="text-align: center; color: var(--text-secondary);">ℹ️ No se encontraron datos para el dispositivo "${deviceId}".</p>`;
      return;
    }

    const stats = data.stats;

    statsDisplayEl.innerHTML = `
      <h4 style="margin-bottom: 15px; color: var(--text-primary);">Estadísticas del Dispositivo: ${deviceId}</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Total Registros</div>
          <div class="stat-value">${stats.count}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Promedio</div>
          <div class="stat-value">${stats.average} dB</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Máximo</div>
          <div class="stat-value" style="color: var(--danger-color);">${
            stats.max
          } dB</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Mínimo</div>
          <div class="stat-value" style="color: var(--success-color);">${
            stats.min
          } dB</div>
        </div>
      </div>
      <p style="margin-top: 15px; font-size: 0.9rem; color: var(--text-secondary);">
        Último registro: ${new Date(stats.latest.timestamp).toLocaleString(
          'es-ES'
        )}
      </p>
    `;
  } catch (error) {
    statsDisplayEl.innerHTML = `<p style="text-align: center; color: var(--danger-color);">❌ Error: ${error.message}</p>`;
  }
});

// Export History
document.getElementById('exportBtn').addEventListener('click', async () => {
  const deviceId = document.getElementById('exportDeviceInput').value.trim();
  const format = document.getElementById('exportFormat').value;
  const saveToStorage = document.getElementById('saveToStorage').checked;
  const statusEl = document.getElementById('exportStatus');

  try {
    statusEl.className = 'status-message show info';
    statusEl.textContent = '💾 Preparando exportación...';

    let url = `${API_BASE_URL}/api/ExportHistory?format=${format}`;
    if (deviceId) {
      url += `&deviceId=${encodeURIComponent(deviceId)}`;
    }
    if (saveToStorage) {
      url += `&saveToStorage=true`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || `Error ${response.status}`);
    }

    // Verificar si es JSON (respuesta con metadata) o archivo directo
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      // Respuesta con metadata (guardado en Storage)
      const data = await response.json();

      if (data.success) {
        statusEl.className = 'status-message show success';
        statusEl.innerHTML = `
          ✅ Exportación completada!<br>
          <small>${data.recordCount} registros exportados</small><br>
          ${
            data.downloadUrl
              ? `<a href="${data.downloadUrl}" target="_blank" style="color: var(--primary-color); text-decoration: underline;">📥 Descargar desde Storage</a>`
              : ''
          }
        `;

        // También descargar el archivo directamente
        if (data.downloadUrl) {
          window.open(data.downloadUrl, '_blank');
        }
      }
    } else {
      // Archivo directo para descarga
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `noise-history-${deviceId || 'all'}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      statusEl.className = 'status-message show success';
      statusEl.textContent = `✅ Archivo descargado exitosamente (${format.toUpperCase()})`;

      if (saveToStorage) {
        // Intentar obtener la URL de Storage
        setTimeout(async () => {
          try {
            const storageResponse = await fetch(`${url}&getStorageUrl=true`);
            if (storageResponse.ok) {
              const storageData = await storageResponse.json();
              if (storageData.downloadUrl) {
                statusEl.innerHTML += `<br><a href="${storageData.downloadUrl}" target="_blank" style="color: var(--primary-color);">📥 También disponible en Storage</a>`;
              }
            }
          } catch (e) {
            // Ignorar error
          }
        }, 1000);
      }
    }

    setTimeout(() => {
      statusEl.className = 'status-message';
    }, 5000);
  } catch (error) {
    statusEl.className = 'status-message show error';
    statusEl.textContent = `❌ Error: ${error.message}`;
  }
});
