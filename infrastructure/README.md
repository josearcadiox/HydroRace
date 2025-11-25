# Infraestructura Azure - Monitor de Bebés IoT

## Archivos Bicep Disponibles

### 1. `main-freetier.bicep` ⭐ **RECOMENDADO para Suscripciones Educativas**

Usa **Cosmos DB Free Tier** (Provisioned mode con 1000 RU/s gratis)

**Ventajas:**
- ✅ **Completamente gratis** (1000 RU/s + 25 GB almacenamiento)
- ✅ **Sin sorpresas** en costos
- ✅ **Perfecto para desarrollo y proyectos universitarios**
- ✅ Basado en tus templates de HydroRace

**Uso:**
```bash
./deploy-nico.sh
```

### 2. `main.bicep` - Cosmos DB Serverless

Usa **Cosmos DB Serverless** (pago por uso)

**Ventajas:**
- ✅ Escala automáticamente
- ✅ Solo pagas por lo que usas
- ✅ Mejor para producción con tráfico variable

**Cuándo usarlo:**
- Cuando superes el Free Tier (1000 RU/s)
- En producción con tráfico impredecible

**Uso:**
```bash
az deployment group create \
  --name babymonitor-deployment \
  --resource-group Nico \
  --template-file main.bicep \
  --parameters location=westus2
```

## Comparación de Costos

| Aspecto | Free Tier (main-freetier.bicep) | Serverless (main.bicep) |
|---------|--------------------------------|-------------------------|
| Costo base | **$0/mes** | $0 + uso |
| RU/s incluidas | 1000 RU/s gratis | 0 (paga desde la primera RU) |
| Almacenamiento | 25 GB gratis | $0.25/GB/mes |
| Mejor para | **Desarrollo, educación** | Producción, tráfico variable |
| Límite | 1000 RU/s máximo | Ilimitado |

## Recursos Desplegados

Ambos Bicep despliegan:

1. **Azure Static Web App** (Free Tier)
   - Hosting del frontend
   - CDN global incluido
   - HTTPS automático

2. **Azure Function App** (Consumption Plan)
   - Backend serverless
   - 1M ejecuciones gratis/mes
   - Escalado automático

3. **Cosmos DB** (Free Tier o Serverless según el archivo)
   - Base de datos NoSQL
   - API SQL
   - Partition key: `/deviceId`

4. **Storage Account** (Standard LRS)
   - Para Azure Functions
   - ~$0.03/mes

## Mejoras Integradas de tus Templates

El `main-freetier.bicep` incluye configuraciones de tus templates de HydroRace:

✅ **Cosmos DB:**
- Free Tier habilitado
- Backup policy configurado
- TLS 1.2 mínimo
- Capacity limit de 1000 RU/s

✅ **Storage Account:**
- HTTPS only
- TLS 1.2 mínimo
- Blob public access deshabilitado
- Encryption habilitado

✅ **Function App:**
- HTTPS only
- FTPS deshabilitado
- CORS configurado
- Node.js 18

## Scripts de Deployment

### `deploy-nico.sh` ⭐ RECOMENDADO

Script personalizado para tu resource group "Nico":
- Detecta automáticamente la ubicación del RG
- Usa `main-freetier.bicep` por defecto
- Muestra outputs al final

### `deploy.sh`

Script genérico (intenta crear RG, no funcionará con permisos limitados)

## Comandos Útiles

### Ver recursos desplegados
```bash
az resource list --resource-group Nico --output table
```

### Ver detalles de Cosmos DB
```bash
az cosmosdb show \
  --name <COSMOS_ACCOUNT_NAME> \
  --resource-group Nico
```

### Ver outputs del deployment
```bash
az deployment group show \
  --name <DEPLOYMENT_NAME> \
  --resource-group Nico \
  --query properties.outputs
```

### Eliminar recursos específicos
```bash
az cosmosdb delete --name <COSMOS_NAME> --resource-group Nico --yes
az staticwebapp delete --name <SWA_NAME> --resource-group Nico --yes
az functionapp delete --name <FUNC_NAME> --resource-group Nico --yes
```

## Troubleshooting

### Error: "Free tier already used"
**Causa:** Solo puedes tener 1 cuenta Cosmos DB con Free Tier por suscripción.

**Solución 1:** Elimina la cuenta Cosmos DB anterior:
```bash
az cosmosdb list --resource-group Nico --output table
az cosmosdb delete --name <OLD_COSMOS_NAME> --resource-group Nico --yes
```

**Solución 2:** Usa `main.bicep` (Serverless) en su lugar:
```bash
az deployment group create \
  --resource-group Nico \
  --template-file main.bicep \
  --parameters location=westus2
```

### Error: "Permission denied bicep"
```bash
chmod +x ~/.azure/bin/bicep
```

### Error: "Authorization failed"
Verifica que tienes permisos de Contributor en el resource group "Nico".

## Estimación de Uso

Para un proyecto universitario con 1 Arduino:

**Escrituras (ReceiveNoiseData):**
- Frecuencia: cada 5 segundos
- RU por operación: ~10 RU
- Total: (12/min × 60 × 24) = 17,280 operaciones/día
- RU/día: 172,800 RU

**Lecturas (GetNoiseHistory):**
- Frontend: cada 10 segundos
- RU por operación: ~3 RU
- Total: (6/min × 60 × 24) = 8,640 operaciones/día
- RU/día: 25,920 RU

**Total RU/día: ~200,000 RU**

Con Free Tier (1000 RU/s):
- Capacidad: 1000 RU/s = 86,400,000 RU/día
- **Uso:** ~0.2% de capacidad
- **Costo: $0** ✅

## Próximos Pasos

1. ✅ Ejecutar `./deploy-nico.sh`
2. ✅ Copiar las URLs de output
3. ✅ Desplegar backend: `func azure functionapp publish <FUNCTION_NAME>`
4. ✅ Actualizar `frontend/app.js` con Function App URL
5. ✅ Desplegar frontend a Static Web App
6. ✅ Configurar Arduino con Function App URL

