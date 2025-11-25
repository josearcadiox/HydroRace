# Guía de Despliegue - Monitor de Bebés IoT

## Requisitos Previos

### Software Necesario
- Azure CLI instalado
- Node.js 18+ instalado
- Azure Functions Core Tools
- Cuenta de Azure activa

### Instalación de Herramientas

```bash
brew install azure-cli
npm install -g azure-functions-core-tools@4
```

## Paso 1: Configurar Azure CLI

```bash
az login

az account list --output table

az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

## Paso 2: Desplegar Infraestructura con Bicep

```bash
cd infrastructure

az group create \
  --name rg-babymonitor-dev \
  --location eastus

az deployment group create \
  --name babymonitor-deployment \
  --resource-group rg-babymonitor-dev \
  --template-file main.bicep \
  --parameters location=eastus

az deployment group show \
  --name babymonitor-deployment \
  --resource-group rg-babymonitor-dev \
  --query properties.outputs
```

## Paso 3: Configurar Backend (Azure Functions)

### Instalar Dependencias

```bash
cd ../backend
npm install
```

### Configurar Variables de Entorno

Actualizar `local.settings.json` con los valores de la salida del deployment:

```json
{
  "IsEncrypted": false,
  "Values": {
    "COSMOS_DB_ENDPOINT": "https://babymonitor-cosmos-dev-xxxxx.documents.azure.com:443/",
    "COSMOS_DB_KEY": "YOUR_COSMOS_KEY_HERE",
    "COSMOS_DB_DATABASE": "BabyMonitorDB",
    "COSMOS_DB_CONTAINER": "NoiseData"
  }
}
```

### Probar Localmente

```bash
npm start
```

### Desplegar a Azure

```bash
FUNCTION_APP_NAME=$(az deployment group show \
  --name babymonitor-deployment \
  --resource-group rg-babymonitor-dev \
  --query 'properties.outputs.functionAppUrl.value' -o tsv | sed 's/https:\/\///' | sed 's/\/.*//')

func azure functionapp publish $FUNCTION_APP_NAME
```

## Paso 4: Desplegar Frontend (Static Web App)

### Obtener Token de Despliegue

```bash
STATIC_APP_NAME=$(az staticwebapp list \
  --resource-group rg-babymonitor-dev \
  --query '[0].name' -o tsv)

DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name $STATIC_APP_NAME \
  --resource-group rg-babymonitor-dev \
  --query 'properties.apiKey' -o tsv)
```

### Actualizar URL del API

Editar `frontend/app.js` y reemplazar:

```javascript
const API_BASE_URL = 'https://YOUR_FUNCTION_APP.azurewebsites.net';
const USE_MOCK_DATA = false;
```

### Desplegar con Azure CLI

```bash
cd ../frontend

az staticwebapp deploy \
  --name $STATIC_APP_NAME \
  --resource-group rg-babymonitor-dev \
  --app-location . \
  --api-location ../backend \
  --deployment-token $DEPLOYMENT_TOKEN
```

## Paso 5: Verificar Despliegue

### URLs de Acceso

```bash
echo "Static Web App: https://$(az staticwebapp show \
  --name $STATIC_APP_NAME \
  --resource-group rg-babymonitor-dev \
  --query 'defaultHostname' -o tsv)"

echo "Function App: https://$FUNCTION_APP_NAME.azurewebsites.net"
```

### Probar Endpoints

```bash
curl -X POST https://$FUNCTION_APP_NAME.azurewebsites.net/api/ReceiveNoiseData \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "baby_01",
    "decibels": 65.5,
    "timestamp": "2024-11-24T10:30:00.000Z"
  }'

curl https://$FUNCTION_APP_NAME.azurewebsites.net/api/GetNoiseHistory
```

## Paso 6: Configurar Arduino

Actualizar el código del Arduino con la URL de la Function App:

```cpp
const char* azureFunctionUrl = "https://YOUR_FUNCTION_APP.azurewebsites.net/api/ReceiveNoiseData";
```

## Monitoreo y Logs

### Ver Logs de Function App

```bash
func azure functionapp logstream $FUNCTION_APP_NAME
```

### Ver Logs en Azure Portal

1. Ir a Azure Portal
2. Navegar a tu Function App
3. Ir a "Monitor" > "Logs"

### Ver Métricas de Cosmos DB

```bash
az cosmosdb show \
  --name $COSMOS_ACCOUNT_NAME \
  --resource-group rg-babymonitor-dev
```

## Troubleshooting

### Error: CORS

Si hay errores de CORS, actualizar la configuración en `main.bicep`:

```bicep
cors: {
  allowedOrigins: [
    'https://YOUR_STATIC_WEB_APP_URL'
  ]
}
```

### Error: Cosmos DB Connection

Verificar que las variables de entorno estén correctamente configuradas:

```bash
az functionapp config appsettings list \
  --name $FUNCTION_APP_NAME \
  --resource-group rg-babymonitor-dev
```

### Error: Function App No Responde

Reiniciar la Function App:

```bash
az functionapp restart \
  --name $FUNCTION_APP_NAME \
  --resource-group rg-babymonitor-dev
```

## Limpieza de Recursos

Para eliminar todos los recursos creados:

```bash
az group delete \
  --name rg-babymonitor-dev \
  --yes \
  --no-wait
```

## Estimación de Costos

Con el tier gratuito/serverless:
- **Static Web App**: Gratuito
- **Function App (Consumption)**: ~$0 (1M ejecuciones gratis/mes)
- **Cosmos DB (Serverless)**: ~$0 (1M RU gratis/mes)
- **Storage Account**: ~$0.03/mes

**Costo Total Estimado**: < $1/mes para uso educativo

