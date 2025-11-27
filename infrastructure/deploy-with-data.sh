#!/bin/bash

RESOURCE_GROUP="Arcadio2"
DEPLOYMENT_NAME="babymonitor-$(date +%s)"

echo "Monitor de Bebés (con datos de prueba)"
echo "Resource Group: $RESOURCE_GROUP"
echo ""

LOCATION=$(az group show --name $RESOURCE_GROUP --query location -o tsv 2>/dev/null)

if [ -z "$LOCATION" ]; then
  echo "Error: Resource group no encontrado"
  exit 1
fi

echo "Ubicación: $LOCATION"
echo "Desplegando recursos..."
echo ""

az deployment group create \
  --name $DEPLOYMENT_NAME \
  --resource-group $RESOURCE_GROUP \
  --template-file main.bicep \
  --parameters location=$LOCATION

if [ $? -eq 0 ]; then
  echo ""
  echo "Despliegue completado"
  echo ""
  
  echo "Obteniendo credenciales de Cosmos DB..."
  COSMOS_ENDPOINT=$(az deployment group show \
    --name $DEPLOYMENT_NAME \
    --resource-group $RESOURCE_GROUP \
    --query 'properties.outputs.cosmosDbEndpoint.value' -o tsv)
  
  COSMOS_ACCOUNT=$(az deployment group show \
    --name $DEPLOYMENT_NAME \
    --resource-group $RESOURCE_GROUP \
    --query 'properties.outputs.cosmosDbAccountName.value' -o tsv)
  
  COSMOS_KEY=$(az cosmosdb keys list \
    --name $COSMOS_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --query 'primaryMasterKey' -o tsv)
  
  if [ -n "$COSMOS_ENDPOINT" ] && [ -n "$COSMOS_KEY" ]; then
    echo ""
    echo "Poblando base de datos con datos de prueba..."
    cd ../backend
    
    export COSMOS_DB_ENDPOINT=$COSMOS_ENDPOINT
    export COSMOS_DB_KEY=$COSMOS_KEY
    
    if [ -f "seed-data.js" ]; then
      node seed-data.js
      echo ""
    else
      echo "Advertencia: No se encontró seed-data.js"
    fi
    
    cd ../infrastructure
  fi
  
  echo ""
  echo "Recursos desplegados:"
  az deployment group show \
    --name $DEPLOYMENT_NAME \
    --resource-group $RESOURCE_GROUP \
    --query properties.outputs \
    -o table
else
  echo "Error en el despliegue"
  exit 1
fi

