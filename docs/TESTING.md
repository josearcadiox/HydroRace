# 🧪 Guía de Pruebas - Monitor de Bebés IoT

## Pruebas del Backend (Azure Functions)

### Pruebas Locales

#### 1. Instalar Dependencias

```bash
cd backend
npm install
```

#### 2. Iniciar Functions Localmente

```bash
npm start
```

Deberías ver:

```
Azure Functions Core Tools
Core Tools Version:       4.x
Function Runtime Version: 4.x

Functions:
  ReceiveNoiseData: [POST] http://localhost:7071/api/ReceiveNoiseData
  GetNoiseHistory: [GET] http://localhost:7071/api/GetNoiseHistory
```

### Test 1: ReceiveNoiseData

#### Caso Exitoso

```bash
curl -X POST http://localhost:7071/api/ReceiveNoiseData \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "baby_01",
    "decibels": 75.5,
    "timestamp": "2024-11-24T10:30:45.123Z"
  }'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "id": "baby_01_1700820645000",
    "deviceId": "baby_01",
    "decibels": 75.5,
    "timestamp": "2024-11-24T10:30:45.123Z",
    "createdAt": "2024-11-24T10:30:45.456Z"
  }
}
```

**Status Code:** 201

#### Caso: Campo Faltante

```bash
curl -X POST http://localhost:7071/api/ReceiveNoiseData \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "baby_01",
    "decibels": 75.5
  }'
```

**Resultado Esperado:**
```json
{
  "error": "Missing required fields: deviceId, decibels, timestamp"
}
```

**Status Code:** 400

#### Caso: Tipo de Dato Incorrecto

```bash
curl -X POST http://localhost:7071/api/ReceiveNoiseData \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "baby_01",
    "decibels": "not_a_number",
    "timestamp": "2024-11-24T10:30:45.123Z"
  }'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "decibels": "NaN"
  }
}
```

**Status Code:** 201 (pero decibels será NaN)

### Test 2: GetNoiseHistory

#### Caso: Obtener Todas las Lecturas

```bash
curl http://localhost:7071/api/GetNoiseHistory
```

**Resultado Esperado:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "baby_01_1700820645000",
      "deviceId": "baby_01",
      "decibels": 75.5,
      "timestamp": "2024-11-24T10:30:45.123Z"
    },
    ...
  ]
}
```

**Status Code:** 200

#### Caso: Filtrar por Dispositivo

```bash
curl "http://localhost:7071/api/GetNoiseHistory?deviceId=baby_01"
```

#### Caso: Limitar Resultados

```bash
curl "http://localhost:7071/api/GetNoiseHistory?limit=10"
```

### Scripts de Prueba Automatizados

#### test_api.sh

```bash
#!/bin/bash

BASE_URL="http://localhost:7071/api"

echo "==================================="
echo "Testing ReceiveNoiseData"
echo "==================================="

echo "Test 1: Valid data"
curl -X POST $BASE_URL/ReceiveNoiseData \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "baby_01",
    "decibels": 65.5,
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }' \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

echo "Test 2: Missing field"
curl -X POST $BASE_URL/ReceiveNoiseData \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "baby_01",
    "decibels": 65.5
  }' \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

echo "Test 3: High noise alert"
curl -X POST $BASE_URL/ReceiveNoiseData \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "baby_01",
    "decibels": 85.0,
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }' \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

echo "==================================="
echo "Testing GetNoiseHistory"
echo "==================================="

echo "Test 4: Get all history"
curl $BASE_URL/GetNoiseHistory \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

echo "Test 5: Get limited history"
curl "$BASE_URL/GetNoiseHistory?limit=5" \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

echo "Test 6: Filter by device"
curl "$BASE_URL/GetNoiseHistory?deviceId=baby_01" \
  -w "\nStatus: %{http_code}\n\n"

echo "==================================="
echo "Tests completed!"
echo "==================================="
```

**Ejecutar:**

```bash
chmod +x test_api.sh
./test_api.sh
```

## Pruebas del Frontend

### Pruebas Manuales

#### 1. Modo Mock (Sin Azure)

1. Abrir `frontend/app.js`
2. Verificar: `const USE_MOCK_DATA = true;`
3. Abrir `index.html` en el navegador
4. Verificar:
   - ✅ Gráfica cargada con 8 datos
   - ✅ Indicador visual funcionando
   - ✅ Valor actual de dB mostrado
   - ✅ Colores según nivel de ruido

#### 2. Modo Conectado (Con Azure)

1. Editar `frontend/app.js`:
   ```javascript
   const API_BASE_URL = 'https://TU-FUNCTION-APP.azurewebsites.net';
   const USE_MOCK_DATA = false;
   ```

2. Abrir DevTools (F12) → Console

3. Verificar requests:
   ```
   GET https://TU-FUNCTION-APP.azurewebsites.net/api/GetNoiseHistory
   Status: 200
   ```

4. Verificar actualización automática cada 10 segundos

### Pruebas de UI

#### Test de Alertas Visuales

**Nivel Normal (< 60 dB):**
- ✅ Indicador verde
- ✅ Texto: "✅ Todo Tranquilo"
- ✅ Sin animación de pulso

**Nivel Precaución (60-70 dB):**
- ✅ Indicador amarillo
- ✅ Texto: "⚡ Precaución: Ruido Moderado"
- ✅ Animación de pulso amarillo

**Nivel Alerta (> 70 dB):**
- ✅ Indicador rojo
- ✅ Texto: "⚠️ ALERTA: Ruido Alto Detectado"
- ✅ Animación de pulso rojo (más rápido)

#### Test Responsive

**Desktop (> 1024px):**
- ✅ Layout de 2 columnas
- ✅ Gráfica grande
- ✅ Indicador a la izquierda

**Tablet/Mobile (< 1024px):**
- ✅ Layout de 1 columna
- ✅ Indicador arriba
- ✅ Gráfica abajo

### Pruebas de Rendimiento

#### Lighthouse Audit

```bash
npm install -g lighthouse

lighthouse http://localhost:8080 --view
```

**Objetivos:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

## Pruebas de Integración

### Test Completo: Arduino → Azure → Frontend

#### Paso 1: Enviar Dato desde Arduino (Simulado)

```bash
curl -X POST https://TU-FUNCTION-APP.azurewebsites.net/api/ReceiveNoiseData \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "baby_01",
    "decibels": 88.5,
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'
```

#### Paso 2: Verificar en Cosmos DB

**Azure Portal:**
1. Ir a Cosmos DB
2. Data Explorer
3. BabyMonitorDB → NoiseData
4. Ejecutar query:
   ```sql
   SELECT * FROM c ORDER BY c.timestamp DESC OFFSET 0 LIMIT 1
   ```

#### Paso 3: Verificar en Frontend

1. Abrir dashboard
2. Esperar hasta 10 segundos (auto-refresh)
3. Verificar:
   - ✅ Nuevo dato en la gráfica
   - ✅ Indicador rojo (88.5 > 70)
   - ✅ Texto de alerta

## Pruebas de Carga

### Apache Bench (ab)

```bash
ab -n 1000 -c 10 -p payload.json -T application/json \
  https://TU-FUNCTION-APP.azurewebsites.net/api/ReceiveNoiseData
```

**payload.json:**
```json
{
  "deviceId": "baby_01",
  "decibels": 75.5,
  "timestamp": "2024-11-24T10:30:45.123Z"
}
```

**Resultados Esperados:**
- Requests per second: > 100
- Time per request: < 100ms (mean)
- Failed requests: 0

### Artillery.io

```bash
npm install -g artillery

artillery quick --count 100 --num 10 \
  https://TU-FUNCTION-APP.azurewebsites.net/api/GetNoiseHistory
```

## Matriz de Pruebas

| Componente | Test | Método | Resultado Esperado |
|------------|------|--------|-------------------|
| Backend | Recibir dato válido | POST /api/ReceiveNoiseData | 201, datos guardados |
| Backend | Campo faltante | POST /api/ReceiveNoiseData | 400, error message |
| Backend | Obtener historial | GET /api/GetNoiseHistory | 200, array de datos |
| Backend | Filtrar por device | GET /api/GetNoiseHistory?deviceId=X | 200, datos filtrados |
| Frontend | Cargar dashboard | Abrir index.html | UI renderizada |
| Frontend | Mostrar gráfica | Con datos mock | Chart.js renderizado |
| Frontend | Alerta roja | decibels > 70 | Indicador rojo |
| Frontend | Alerta amarilla | 60 < decibels < 70 | Indicador amarillo |
| Frontend | Normal | decibels < 60 | Indicador verde |
| Integration | Arduino → DB | POST desde Arduino | Dato en Cosmos DB |
| Integration | DB → Frontend | Refresh frontend | Dato en gráfica |

## Troubleshooting de Pruebas

### Error: "Network request failed"

**Causa:** CORS no configurado

**Solución:**
```bicep
cors: {
  allowedOrigins: ['*']
}
```

### Error: "Cannot read property 'data'"

**Causa:** API response con formato incorrecto

**Solución:** Verificar que la API devuelve:
```json
{
  "success": true,
  "data": [...]
}
```

### Gráfica no se actualiza

**Causa:** Auto-refresh no funciona

**Solución:** Verificar en console:
```javascript
console.log('Refreshing data...');
```

### Datos no aparecen en Cosmos DB

**Causa:** Configuración incorrecta

**Solución:** Verificar App Settings:
```bash
az functionapp config appsettings list \
  --name TU-FUNCTION-APP \
  --resource-group rg-babymonitor-dev
```

## Checklist de Testing

### Antes de Despliegue
- [ ] Tests unitarios backend pasados
- [ ] Tests de integración pasados
- [ ] Frontend funciona con mock data
- [ ] Frontend funciona con API real
- [ ] Alertas visuales funcionan
- [ ] Responsive design verificado
- [ ] CORS configurado
- [ ] Variables de entorno configuradas

### Después de Despliegue
- [ ] Endpoints responden (200/201)
- [ ] Datos se guardan en Cosmos DB
- [ ] Frontend consume API correctamente
- [ ] Auto-refresh funciona
- [ ] Alertas se activan correctamente
- [ ] Performance aceptable (< 2s load)
- [ ] Sin errores en console
- [ ] Arduino conecta y envía datos

