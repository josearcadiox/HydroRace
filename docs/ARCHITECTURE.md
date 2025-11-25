# 🏗️ Arquitectura del Sistema - Monitor de Bebés IoT

## Diagrama de Arquitectura Completa

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CAPA DE DISPOSITIVOS IoT                      │
│                                                                       │
│  ┌────────────┐              ┌────────────┐                         │
│  │  Arduino   │              │  Arduino   │                         │
│  │  ESP8266   │              │  ESP32     │                         │
│  │            │              │            │                         │
│  │ + Sensor   │              │ + Sensor   │                         │
│  │   Ruido    │              │   Ruido    │                         │
│  └─────┬──────┘              └─────┬──────┘                         │
│        │                           │                                 │
│        └───────────┬───────────────┘                                │
│                    │ WiFi (HTTPS POST)                              │
└────────────────────┼────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          CAPA DE INGESTA                             │
│                                                                       │
│  ┌──────────────────────────────────────────────────────┐           │
│  │           Azure Function App (Consumption)            │           │
│  │  ┌────────────────────────────────────────────────┐  │           │
│  │  │  ReceiveNoiseData (HTTP Trigger)               │  │           │
│  │  │  - Validación de datos                         │  │           │
│  │  │  - Enriquecimiento (timestamp, id)             │  │           │
│  │  │  - Persistencia en DB                          │  │           │
│  │  └────────────────────────────────────────────────┘  │           │
│  └──────────────────────┬───────────────────────────────┘           │
└─────────────────────────┼────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CAPA DE PERSISTENCIA                            │
│                                                                       │
│  ┌──────────────────────────────────────────────────────┐           │
│  │           Azure Cosmos DB (Serverless)                │           │
│  │                                                        │           │
│  │  Database: BabyMonitorDB                              │           │
│  │  Container: NoiseData                                 │           │
│  │  Partition Key: /deviceId                             │           │
│  │                                                        │           │
│  │  [{id, deviceId, decibels, timestamp, createdAt}]    │           │
│  └──────────────────────┬───────────────────────────────┘           │
└─────────────────────────┼────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        CAPA DE API                                   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────┐           │
│  │           Azure Function App (Consumption)            │           │
│  │  ┌────────────────────────────────────────────────┐  │           │
│  │  │  GetNoiseHistory (HTTP Trigger)                │  │           │
│  │  │  - Query a Cosmos DB                           │  │           │
│  │  │  - Filtrado y ordenamiento                     │  │           │
│  │  │  - Respuesta JSON                              │  │           │
│  │  └────────────────────────────────────────────────┘  │           │
│  └──────────────────────┬───────────────────────────────┘           │
└─────────────────────────┼────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN                             │
│                                                                       │
│  ┌──────────────────────────────────────────────────────┐           │
│  │         Azure Static Web App (Free Tier)              │           │
│  │                                                        │           │
│  │  ┌────────────────────────────────────────────────┐  │           │
│  │  │  Frontend (HTML/CSS/JS + Chart.js)             │  │           │
│  │  │  - Dashboard interactivo                       │  │           │
│  │  │  - Gráficas en tiempo real                     │  │           │
│  │  │  - Sistema de alertas visuales                 │  │           │
│  │  │  - Auto-refresh cada 10s                       │  │           │
│  │  └────────────────────────────────────────────────┘  │           │
│  └─────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
                    ┌──────────┐
                    │  Usuario │
                    └──────────┘
```

## Flujo de Datos Detallado

### 1. Captura y Envío (Arduino → Azure Function)

```
┌──────────┐     WiFi HTTPS POST      ┌─────────────────┐
│ Arduino  │ ─────────────────────────>│ReceiveNoiseData │
│          │  JSON: {deviceId,         │   Function      │
│ Sensor   │        decibels,          │                 │
│          │        timestamp}         └────────┬────────┘
└──────────┘                                    │
                                                │ Validación
                                                │ Enriquecimiento
                                                ▼
                                        ┌──────────────┐
                                        │  Cosmos DB   │
                                        │  INSERT      │
                                        └──────────────┘
```

**Detalles:**
- Protocolo: HTTPS
- Formato: JSON
- Autenticación: Anonymous (puede configurarse con API Key)
- Frecuencia: Cada 5 segundos o cuando decibeles > threshold

### 2. Consulta y Visualización (Frontend → Azure Function)

```
┌──────────┐    HTTPS GET Request     ┌─────────────────┐
│ Frontend │ ─────────────────────────>│ GetNoiseHistory │
│          │                           │   Function      │
│ Browser  │                           └────────┬────────┘
│          │                                    │
└────┬─────┘                                    │ Query
     │                                          ▼
     │                                  ┌──────────────┐
     │                                  │  Cosmos DB   │
     │                                  │  SELECT TOP  │
     │                                  └────────┬─────┘
     │                                           │
     │      JSON Response                        │
     │<──────────────────────────────────────────┘
     │
     ▼
┌─────────────┐
│  Chart.js   │
│  Renderiza  │
│  Gráfica    │
└─────────────┘
```

**Detalles:**
- Consulta: Últimas 50 lecturas ordenadas por timestamp
- Auto-refresh: Cada 10 segundos
- Filtro opcional: Por deviceId

## Componentes del Sistema

### 1. Dispositivos IoT (Arduino)

**Responsabilidades:**
- Captura de datos del sensor de ruido
- Conversión a decibeles
- Conexión WiFi
- Envío de datos vía HTTPS
- Manejo de reconexiones

**Tecnologías:**
- ESP8266 / ESP32
- Sensor de ruido (KY-037, MAX4466, MAX9814)
- ArduinoJson library
- HTTPClient library

### 2. Ingesta de Datos (Azure Function - ReceiveNoiseData)

**Responsabilidades:**
- Recepción de datos HTTP POST
- Validación de esquema JSON
- Generación de ID único
- Timestamp de creación
- Persistencia en Cosmos DB

**Tecnologías:**
- Node.js 18
- Azure Functions Runtime v4
- @azure/cosmos SDK

**Código Clave:**
```javascript
{
  "deviceId": "baby_01",
  "decibels": 75.5,
  "timestamp": "2024-11-24T10:30:45.123Z"
}
```

### 3. Almacenamiento (Cosmos DB)

**Responsabilidades:**
- Almacenamiento de series de tiempo
- Indexación automática
- Consultas SQL-like
- Escalabilidad horizontal

**Configuración:**
- Modo: Serverless
- API: Core (SQL)
- Partition Key: /deviceId (permite escalar por dispositivo)
- Consistencia: Session (balance entre consistencia y latencia)

**Modelo de Datos:**
```json
{
  "id": "baby_01_1700000000000",
  "deviceId": "baby_01",
  "decibels": 75.5,
  "timestamp": "2024-11-24T10:30:45.123Z",
  "createdAt": "2024-11-24T10:30:45.456Z"
}
```

### 4. API de Consulta (Azure Function - GetNoiseHistory)

**Responsabilidades:**
- Exposición de API REST
- Consultas optimizadas
- Filtrado y ordenamiento
- Paginación (límite de registros)

**Endpoints:**
```
GET /api/GetNoiseHistory?limit=50
GET /api/GetNoiseHistory?deviceId=baby_01&limit=20
```

**Respuesta:**
```json
{
  "success": true,
  "count": 50,
  "data": [...]
}
```

### 5. Frontend (Static Web App)

**Responsabilidades:**
- Dashboard interactivo
- Visualización de datos (Chart.js)
- Sistema de alertas
- Auto-actualización
- Responsive design

**Componentes Clave:**
- `index.html`: Estructura
- `styles.css`: Diseño moderno con gradientes y animaciones
- `app.js`: Lógica de negocio y llamadas API

**Features:**
- 📊 Gráfica de líneas con Chart.js
- 🚨 Indicador visual de alerta (verde/amarillo/rojo)
- 🔄 Auto-refresh cada 10 segundos
- 📱 Diseño responsive
- 🎨 UI moderna con animaciones

## Estrategia de Escalabilidad

### Horizontal Scaling

```
Multiple Arduinos ──┐
                    ├──> Function App (auto-scale) ──> Cosmos DB (partitioned by deviceId)
Multiple Devices ───┘
```

**Ventajas:**
- Function App escala automáticamente
- Cosmos DB particiona por deviceId
- Static Web App usa CDN global

### Optimizaciones

1. **Cosmos DB Partitioning:**
   - Partition Key: `/deviceId`
   - Permite queries eficientes por dispositivo
   - Distribución automática de carga

2. **Function App:**
   - Consumption Plan: Auto-scaling
   - Cold start < 3 segundos
   - Concurrent executions: hasta 200

3. **Frontend:**
   - CDN global de Azure
   - Caché de assets estáticos
   - Compresión gzip/brotli

## Seguridad

### Capas de Seguridad

```
┌─────────────────────────────────────────┐
│ 1. Transport Layer                      │
│    - HTTPS everywhere                   │
│    - TLS 1.2+                           │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 2. Authentication (Opcional)            │
│    - Function keys                      │
│    - API Management                     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 3. Network Layer                        │
│    - CORS configurado                   │
│    - Rate limiting                      │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 4. Data Layer                           │
│    - Cosmos DB keys en Key Vault        │
│    - Encryption at rest                 │
└─────────────────────────────────────────┘
```

### Implementaciones de Seguridad

1. **HTTPS Only:**
   ```bicep
   httpsOnly: true
   minTlsVersion: '1.2'
   ```

2. **CORS Configuration:**
   ```bicep
   cors: {
     allowedOrigins: [
       'https://${staticWebApp.properties.defaultHostname}'
     ]
   }
   ```

3. **Secrets Management:**
   - Cosmos DB keys en App Settings
   - No hardcoded en código
   - Rotación de keys recomendada

## Monitoreo y Observabilidad

### Métricas Clave

1. **Application Insights:**
   - Request rate
   - Response time
   - Error rate
   - Dependency calls

2. **Cosmos DB Metrics:**
   - Request Units (RU/s)
   - Storage usage
   - Throttling events

3. **Function App Metrics:**
   - Execution count
   - Execution duration
   - Success rate

### Logging

```javascript
context.log('Noise data received:', { deviceId, decibels });
context.error('Error processing data:', error);
```

## Costo Estimado Mensual

| Servicio | Tier | Uso Estimado | Costo |
|----------|------|--------------|-------|
| Static Web App | Free | < 100GB bandwidth | $0 |
| Function App | Consumption | < 1M requests | $0 |
| Cosmos DB | Serverless | < 1M RU | $0 |
| Storage Account | Standard LRS | 1 GB | $0.03 |
| **TOTAL** | | | **< $1/mes** |

### Cálculo de RU (Request Units)

- INSERT (ReceiveNoiseData): ~10 RU por operación
- SELECT (GetNoiseHistory): ~3 RU por operación

**Ejemplo:** 
- 1 Arduino enviando cada 5 segundos
- Frontend consultando cada 10 segundos
- 30 días

```
Writes: (60/5) * 60 * 24 * 30 * 10 RU = 2,592,000 RU
Reads:  (60/10) * 60 * 24 * 30 * 3 RU = 777,600 RU
Total:  3,369,600 RU/mes

Costo: (3.37M - 1M free) * $0.25 per 1M = $0.59/mes
```

## Futuras Mejoras

### Fase 2 - Notificaciones
- Azure Event Grid para eventos en tiempo real
- Azure Logic Apps para envío de emails/SMS
- WebSockets para updates instantáneos

### Fase 3 - Machine Learning
- Azure Machine Learning para detección de patrones
- Predicción de eventos de ruido
- Clasificación de tipos de llanto

### Fase 4 - Análisis Avanzado
- Azure Stream Analytics para análisis en tiempo real
- Power BI para reportes y dashboards avanzados
- Azure Data Lake para almacenamiento histórico

