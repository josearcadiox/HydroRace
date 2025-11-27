#!/bin/bash

echo "Poblando base de datos con datos de prueba..."
echo ""

if [ ! -f "local.settings.json" ]; then
  echo "Error: No se encontró local.settings.json"
  exit 1
fi

export COSMOS_DB_ENDPOINT=$(grep -o '"COSMOS_DB_ENDPOINT": "[^"]*"' local.settings.json | cut -d'"' -f4)
export COSMOS_DB_KEY=$(grep -o '"COSMOS_DB_KEY": "[^"]*"' local.settings.json | cut -d'"' -f4)

if [ -z "$COSMOS_DB_ENDPOINT" ] || [ -z "$COSMOS_DB_KEY" ]; then
  echo "Error: Configura COSMOS_DB_ENDPOINT y COSMOS_DB_KEY en local.settings.json"
  exit 1
fi

node seed-data.js

