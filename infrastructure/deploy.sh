#!/bin/bash

RESOURCE_GROUP="rg-babymonitor-dev"
LOCATION="eastus"
DEPLOYMENT_NAME="babymonitor-deployment-$(date +%s)"

echo "Creating resource group..."
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

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

