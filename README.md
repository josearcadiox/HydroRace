# Monitor de Bebés IoT

Proyecto universitario que monitorea el nivel de ruido en la habitación de un bebé usando Arduino y Azure Cloud.

## Descripción

Sistema que captura datos de ruido con un sensor conectado a Arduino ESP8266/ESP32, los envía a Azure y los visualiza en una aplicación web en tiempo real.

## Componentes

- **Arduino (ESP8266/ESP32)** - Captura niveles de ruido y los envía vía WiFi
- **Azure Functions** - Backend que recibe y consulta datos
- **Cosmos DB** - Base de datos NoSQL (Free Tier)
- **Azure Static Web App** - Frontend con dashboard interactivo

## Estructura del Proyecto

```
proyecto/
├── infrastructure/
│   ├── main.bicep          # Recursos de Azure
│   └── deploy.sh           # Script de despliegue
├── backend/
│   └── src/functions/
│       ├── ReceiveNoiseData.js
│       └── GetNoiseHistory.js
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── docs/
    ├── DATABASE_SCHEMA.md
    └── ARDUINO_EXAMPLE.md
```

## Instalación

### 1. Desplegar en Azure

```bash
cd infrastructure
./deploy.sh
```

Esto crea los recursos necesarios en Azure.

### 2. Configurar Backend

```bash
cd backend
npm install
```

Actualizar `local.settings.json` con las credenciales de Cosmos DB.

### 3. Configurar Frontend

Editar `frontend/app.js`:

```javascript
const API_BASE_URL = 'https://tu-function-app.azurewebsites.net';
const USE_MOCK_DATA = false;
```

### 4. Configurar Arduino

Ver código completo en `docs/ARDUINO_EXAMPLE.md`

Actualizar las credenciales WiFi y URL del API:

```cpp
const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";
const char* azureFunctionUrl = "https://tu-function-app.azurewebsites.net/api/ReceiveNoiseData";
```

## Uso

El sistema muestra:

- Indicador visual de nivel de ruido (verde/amarillo/rojo)
- Gráfica con historial de las últimas lecturas
- Actualización automática cada 10 segundos

### Niveles de Alerta

- **Verde** (< 60 dB): Todo tranquilo
- **Amarillo** (60-70 dB): Precaución
- **Rojo** (> 70 dB): Alerta de ruido alto

## Esquema de Datos

### Formato de envío desde Arduino

```json
{
  "deviceId": "baby_01",
  "decibels": 75.5,
  "timestamp": "2024-11-24T10:30:45.123Z"
}
```

### Formato en Cosmos DB

```json
{
  "id": "baby_01_1700000000000",
  "deviceId": "baby_01",
  "decibels": 75.5,
  "timestamp": "2024-11-24T10:30:45.123Z",
  "createdAt": "2024-11-24T10:30:45.456Z"
}
```

## API Endpoints

### POST /api/ReceiveNoiseData
Recibe datos del Arduino

### GET /api/GetNoiseHistory?limit=50
Obtiene historial de lecturas

## Costos

Usando servicios gratuitos de Azure:

- Static Web App: Gratis
- Function App: Gratis (1M ejecuciones/mes)
- Cosmos DB: Gratis (Free Tier con 1000 RU/s)
- Storage: ~$0.03/mes

**Total: < $1/mes**

## Documentación Adicional

- `docs/DATABASE_SCHEMA.md` - Detalles de la base de datos
- `docs/ARDUINO_EXAMPLE.md` - Código completo para Arduino

## Notas

- El frontend incluye datos de prueba (modo mock) para desarrollo sin Azure
- Se requiere suscripción de Azure para desplegar
- Compatible con ESP8266 y ESP32

---

Proyecto Universitario - Redes y Sistemas IoT
