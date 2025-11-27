#!/bin/bash

RESOURCE_GROUP="Arcadio"
LOCATION="eastus"
DEPLOYMENT_NAME="babymonitor-deployment-$(date +%s)"

echo "Using existing resource group: $RESOURCE_GROUP"
echo "Deploying infrastructure..."
az deployment group create \
  --name $DEPLOYMENT_NAME \
  --resource-group $RESOURCE_GROUP \
  --template-file main.bicep \
  --parameters location=$LOCATION

echo "Deployment complete!"
echo "Getting outputs..."
az deployment group show \
  --name $DEPLOYMENT_NAME \
  --resource-group $RESOURCE_GROUP \
  --query properties.outputs

