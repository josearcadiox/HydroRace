#!/bin/bash

RESOURCE_GROUP="Arcadio2"
DEPLOYMENT_NAME="babymonitor-deployment-$(date +%s)"

echo "================================================"
echo "Monitor de Bebés IoT - Deployment"
echo "================================================"
echo "Resource Group: $RESOURCE_GROUP"
echo ""

echo "Obteniendo ubicación del resource group..."
LOCATION=$(az group show --name $RESOURCE_GROUP --query location -o tsv 2>/dev/null)

if [ -z "$LOCATION" ]; then
  echo "Error: No se pudo encontrar el resource group '$RESOURCE_GROUP'"
  echo "Verifica que el resource group existe con: az group list --output table"
  exit 1
fi

echo "Ubicación: $LOCATION"
echo ""

echo "Desplegando infraestructura..."
echo "Usando: main-freetier.bicep (Cosmos DB Free Tier - Recomendado para suscripciones educativas)"
echo ""
az deployment group create \
  --name $DEPLOYMENT_NAME \
  --resource-group $RESOURCE_GROUP \
  --template-file main-freetier.bicep \
  --parameters location=$LOCATION

if [ $? -eq 0 ]; then
  echo ""
  echo "================================================"
  echo "✅ Deployment completado exitosamente!"
  echo "================================================"
  echo ""
  echo "Obteniendo URLs de los servicios..."
  az deployment group show \
    --name $DEPLOYMENT_NAME \
    --resource-group $RESOURCE_GROUP \
    --query properties.outputs \
    -o table
  
  echo ""
  echo "================================================"
  echo "Próximos pasos:"
  echo "================================================"
  echo "1. Copiar el 'functionAppUrl' para configurar el frontend"
  echo "2. Desplegar el backend: cd ../backend && func azure functionapp publish <FUNCTION_APP_NAME>"
  echo "3. Actualizar frontend/app.js con la URL de la Function App"
  echo "4. Desplegar el frontend a Static Web App"
else
  echo ""
  echo "❌ Error durante el deployment"
  echo "Revisa los errores arriba"
  exit 1
fi

