# 🍼 Monitor de Bebés IoT - Proyecto Universitario

Sistema de monitoreo de ruido en tiempo real usando Arduino, Azure Cloud y tecnologías web modernas.

## 📋 Descripción del Proyecto

Este proyecto implementa un sistema IoT completo para monitorear el nivel de ruido en la habitación de un bebé. Utiliza dispositivos Arduino con módulo Wi-Fi para capturar datos de ruido y los envía a una infraestructura cloud en Azure para su procesamiento, almacenamiento y visualización en tiempo real.

## 🏗️ Arquitectura del Sistema

```
┌─────────────┐
│   Arduino   │ ──WiFi──> ┌──────────────────┐
│  + Sensor   │           │  Azure Function  │
│   Ruido     │           │  ReceiveNoiseData│
└─────────────┘           └─────────┬────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │   Cosmos DB     │
                          │  (Serverless)   │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Azure Function  │
                          │ GetNoiseHistory │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  Static Web App │
                          │   (Frontend)    │
                          └─────────────────┘
```

## 🚀 Tecnologías Utilizadas

### Backend
- **Azure Functions** (Node.js 18)
- **Cosmos DB** (Serverless)
- **Bicep** (Infrastructure as Code)

### Frontend
- **HTML5 / CSS3**
- **JavaScript (Vanilla)**
- **Chart.js** para visualización

### Hardware
- **Arduino** (ESP8266/ESP32)
- **Módulo Wi-Fi**
- **Sensor de Ruido**

## 📁 Estructura del Proyecto

```
proyecto/
├── infrastructure/          # Infraestructura como código (Bicep)
│   ├── main.bicep          # Definición de recursos Azure
│   └── deploy.sh           # Script de despliegue
│
├── backend/                # Azure Functions (Node.js)
│   ├── src/
│   │   ├── functions/
│   │   │   ├── ReceiveNoiseData.js    # Recibe datos del Arduino
│   │   │   └── GetNoiseHistory.js     # API para el frontend
│   │   └── shared/
│   │       └── cosmosClient.js        # Cliente Cosmos DB
│   ├── package.json
│   ├── host.json
│   └── local.settings.json
│
├── frontend/               # Aplicación web estática
│   ├── index.html         # Página principal
│   ├── styles.css         # Estilos
│   └── app.js             # Lógica del cliente
│
└── docs/                  # Documentación
    ├── DATABASE_SCHEMA.md      # Esquema de base de datos
    └── DEPLOYMENT_GUIDE.md     # Guía de despliegue
```

## 🎯 Funcionalidades

### Captura de Datos
- ✅ Recepción de datos JSON desde dispositivos Arduino
- ✅ Almacenamiento en Cosmos DB serverless
- ✅ Validación de datos entrantes

### Visualización
- ✅ Gráfica de historial de ruido (últimas 50 lecturas)
- ✅ Indicador visual de alerta (verde/amarillo/rojo)
- ✅ Actualización automática cada 10 segundos
- ✅ Interfaz responsive y moderna

### Alertas
- 🟢 **Verde**: < 60 dB - Todo tranquilo
- 🟡 **Amarillo**: 60-70 dB - Precaución
- 🔴 **Rojo**: > 70 dB - Alerta de ruido alto

## 🔧 Configuración y Despliegue

### Requisitos Previos

```bash
node --version        # v18+
az --version          # Azure CLI
func --version        # Azure Functions Core Tools v4
```

### Instalación Local

```bash
git clone <tu-repositorio>
cd proyecto

cd backend
npm install

cd ../frontend
```

### Despliegue a Azure

Ver la [Guía de Despliegue](docs/DEPLOYMENT_GUIDE.md) completa.

Resumen rápido:

```bash
cd infrastructure
./deploy.sh

cd ../backend
func azure functionapp publish <FUNCTION_APP_NAME>

cd ../frontend
az staticwebapp deploy --name <STATIC_APP_NAME> --resource-group rg-babymonitor-dev
```

## 📊 Esquema de Datos

### Formato de Envío (Arduino → Azure)

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

Ver [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) para más detalles.

## 🔌 API Endpoints

### POST /api/ReceiveNoiseData
Recibe datos del dispositivo Arduino.

**Request:**
```json
{
  "deviceId": "baby_01",
  "decibels": 65.5,
  "timestamp": "2024-11-24T10:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "baby_01_1700000000000",
    "deviceId": "baby_01",
    "decibels": 65.5,
    "timestamp": "2024-11-24T10:30:00.000Z",
    "createdAt": "2024-11-24T10:30:00.123Z"
  }
}
```

### GET /api/GetNoiseHistory
Obtiene el historial de lecturas.

**Query Params:**
- `limit` (opcional): Número de registros (default: 50)
- `deviceId` (opcional): Filtrar por dispositivo

**Response:**
```json
{
  "success": true,
  "count": 50,
  "data": [...]
}
```

## 💰 Estimación de Costos

Utilizando tiers gratuitos/serverless de Azure:

| Servicio | Tier | Costo Estimado |
|----------|------|----------------|
| Static Web App | Free | $0 |
| Function App | Consumption | ~$0 (1M req/mes gratis) |
| Cosmos DB | Serverless | ~$0 (1M RU/mes gratis) |
| Storage Account | Standard LRS | ~$0.03/mes |

**Total**: < $1/mes para uso educativo

## 🧪 Modo de Prueba

El frontend incluye datos ficticios para pruebas sin necesidad de Azure:

```javascript
const USE_MOCK_DATA = true;
```

Cambiar a `false` una vez configurada la conexión con Azure.

## 📝 Notas del Proyecto

- ✅ Arquitectura Serverless para minimizar costos
- ✅ Infraestructura como Código (IaC) con Bicep
- ✅ API RESTful con Azure Functions
- ✅ Base de datos NoSQL escalable
- ✅ Frontend moderno y responsive
- ✅ Listo para integración con Arduino

## 🎓 Contexto Académico

Este proyecto es parte de un curso universitario de Redes y sistemas IoT. Demuestra:

1. Integración de hardware (Arduino) con cloud
2. Arquitectura de microservicios serverless
3. Uso de servicios PaaS de Azure
4. Infrastructure as Code (IaC)
5. Desarrollo Full Stack

## 📄 Licencia

Proyecto Universitario - Uso Educativo

## 👨‍💻 Autor

Proyecto desarrollado para curso de Redes - Universidad

---

**Nota**: Este proyecto está diseñado con servicios gratuitos/serverless de Azure para mantener costos mínimos durante el desarrollo y demostración.

