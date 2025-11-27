#!/bin/bash

RESOURCE_GROUP="Arcadio2"
DEPLOYMENT_NAME="babymonitor-$(date +%s)"

echo "Monitor de Bebés"
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
  az deployment group show \
    --name $DEPLOYMENT_NAME \
    --resource-group $RESOURCE_GROUP \
    --query properties.outputs \
    -o table
else
  echo "Error en el despliegue"
  exit 1
fi
