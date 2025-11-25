# 🚀 Guía Rápida - Monitor de Bebés IoT

## Para Empezar AHORA (Modo Demo con Datos Ficticios)

### 1. Probar el Frontend Localmente

```bash
cd frontend
```

Abrir `index.html` directamente en el navegador. ¡Listo! Verás datos ficticios.

El frontend está configurado con:
```javascript
const USE_MOCK_DATA = true;
```

Esto muestra 8 lecturas de prueba sin necesidad de Azure.

### 2. Probar las Azure Functions Localmente

```bash
cd backend
npm install
npm start
```

Las funciones correrán en `http://localhost:7071`

**Probar con curl:**

```bash
curl -X POST http://localhost:7071/api/ReceiveNoiseData \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "baby_01",
    "decibels": 75.5,
    "timestamp": "2024-11-24T10:30:00.000Z"
  }'

curl http://localhost:7071/api/GetNoiseHistory
```

> **Nota:** Las funciones locales no guardarán datos hasta configurar Cosmos DB.

---

## Pasos para Desplegar en Azure (Cuando Estés Listo)

### Paso 1: Crear Recursos con Bicep (5 minutos)

```bash
cd infrastructure

az login

az group create --name rg-babymonitor-dev --location eastus

az deployment group create \
  --name babymonitor-deployment \
  --resource-group rg-babymonitor-dev \
  --template-file main.bicep
```

Esto crea:
- ✅ Static Web App
- ✅ Function App  
- ✅ Cosmos DB
- ✅ Storage Account

### Paso 2: Obtener las URLs

```bash
az deployment group show \
  --name babymonitor-deployment \
  --resource-group rg-babymonitor-dev \
  --query properties.outputs
```

Copiar:
- `functionAppUrl`: Para configurar el frontend y Arduino
- `cosmosDbEndpoint` y key: Para configurar las Functions
- `staticWebAppUrl`: Tu aplicación web final

### Paso 3: Desplegar Backend (2 minutos)

```bash
cd ../backend

FUNCTION_APP_NAME="<nombre-del-output>"

func azure functionapp publish $FUNCTION_APP_NAME
```

### Paso 4: Configurar y Desplegar Frontend (2 minutos)

**Editar `frontend/app.js`:**

```javascript
const API_BASE_URL = 'https://TU-FUNCTION-APP.azurewebsites.net';
const USE_MOCK_DATA = false;
```

**Desplegar:**

```bash
cd ../frontend

STATIC_APP_NAME="<nombre-del-output>"

az staticwebapp deploy \
  --name $STATIC_APP_NAME \
  --resource-group rg-babymonitor-dev \
  --app-location .
```

### Paso 5: Configurar Arduino (5 minutos)

**Editar las variables en el código Arduino:**

```cpp
const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";
const char* azureFunctionUrl = "https://TU-FUNCTION-APP.azurewebsites.net/api/ReceiveNoiseData";
```

**Subir el código al Arduino y listo!**

---

## Verificación Rápida

### ✅ Checklist de Despliegue

- [ ] Recursos creados en Azure
- [ ] Function App desplegada
- [ ] Frontend desplegado  
- [ ] URLs obtenidas
- [ ] Frontend configurado con API_BASE_URL
- [ ] Arduino configurado con WiFi y URL
- [ ] Datos llegando a Cosmos DB
- [ ] Dashboard mostrando información

### 🧪 Probar el Sistema Completo

**1. Enviar dato de prueba:**

```bash
curl -X POST https://TU-FUNCTION-APP.azurewebsites.net/api/ReceiveNoiseData \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "baby_01",
    "decibels": 85.0,
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'
```

**2. Verificar en el frontend:**

Abrir `https://TU-STATIC-WEB-APP.azurestaticapps.net`

Deberías ver:
- Gráfica con el dato
- Indicador rojo (85 dB > 70 dB)
- "ALERTA: Ruido Alto Detectado"

---

## Comandos Útiles

### Ver Logs de la Function App

```bash
func azure functionapp logstream TU-FUNCTION-APP
```

### Ver Estado de los Recursos

```bash
az resource list \
  --resource-group rg-babymonitor-dev \
  --output table
```

### Eliminar Todo (Limpieza)

```bash
az group delete \
  --name rg-babymonitor-dev \
  --yes
```

---

## Troubleshooting Rápido

### ❌ Error: "CORS"
**Solución:** Agregar tu dominio en `main.bicep` → `cors.allowedOrigins`

### ❌ Error: "Cannot connect to Cosmos DB"
**Solución:** Verificar que `COSMOS_DB_ENDPOINT` y `COSMOS_DB_KEY` estén en la configuración de la Function App

### ❌ Frontend no muestra datos
**Solución:** 
1. Verificar `USE_MOCK_DATA = false`
2. Verificar `API_BASE_URL` correcto
3. Abrir DevTools → Console para ver errores

### ❌ Arduino no envía datos
**Solución:**
1. Verificar WiFi conectado (ver Serial Monitor)
2. Verificar URL de Azure Function
3. Verificar formato JSON

---

## Estructura de Archivos Clave

```
proyecto/
├── infrastructure/
│   └── main.bicep              ← DESPLEGAR PRIMERO
├── backend/
│   └── src/functions/          ← DESPLEGAR SEGUNDO
└── frontend/
    ├── app.js                  ← CONFIGURAR URL AQUÍ
    └── index.html              ← DESPLEGAR TERCERO
```

---

## Recursos de Ayuda

- 📖 [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Estructura de datos
- 📖 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guía detallada
- 📖 [ARDUINO_EXAMPLE.md](ARDUINO_EXAMPLE.md) - Código Arduino completo
- 📖 [README.md](../README.md) - Documentación general

---

## Estimación de Tiempo Total

| Etapa | Tiempo |
|-------|--------|
| Crear recursos Azure | 5 min |
| Desplegar backend | 2 min |
| Configurar frontend | 2 min |
| Desplegar frontend | 2 min |
| Configurar Arduino | 5 min |
| **TOTAL** | **~15 minutos** |

¡Éxito con tu proyecto! 🎉

