# Esquema de Base de Datos - Cosmos DB

## Configuración de Cosmos DB

- **Tipo**: Serverless
- **API**: Core (SQL)
- **Base de Datos**: BabyMonitorDB
- **Contenedor**: NoiseData
- **Partition Key**: `/deviceId`

## Estructura del Documento

### NoiseData Collection

Cada documento representa una lectura de ruido capturada por el dispositivo IoT.

```json
{
  "id": "baby_01_1700000000000",
  "deviceId": "baby_01",
  "decibels": 75.5,
  "timestamp": "2024-11-24T10:30:45.123Z",
  "createdAt": "2024-11-24T10:30:45.456Z"
}
```

### Campos del Documento

| Campo | Tipo | Descripción | Requerido | Ejemplo |
|-------|------|-------------|-----------|---------|
| `id` | string | Identificador único (deviceId_timestamp) | ✅ | "baby_01_1700000000000" |
| `deviceId` | string | ID del dispositivo Arduino | ✅ | "baby_01" |
| `decibels` | number | Nivel de ruido en decibeles | ✅ | 75.5 |
| `timestamp` | string | Fecha/hora de la lectura (ISO 8601) | ✅ | "2024-11-24T10:30:45.123Z" |
| `createdAt` | string | Fecha/hora de inserción en DB | ✅ | "2024-11-24T10:30:45.456Z" |

## Ejemplo de Datos de Prueba

```json
[
  {
    "id": "baby_01_1700000001000",
    "deviceId": "baby_01",
    "decibels": 45.2,
    "timestamp": "2024-11-24T10:25:00.000Z",
    "createdAt": "2024-11-24T10:25:00.123Z"
  },
  {
    "id": "baby_01_1700000002000",
    "deviceId": "baby_01",
    "decibels": 52.8,
    "timestamp": "2024-11-24T10:26:00.000Z",
    "createdAt": "2024-11-24T10:26:00.234Z"
  },
  {
    "id": "baby_01_1700000003000",
    "deviceId": "baby_01",
    "decibels": 78.3,
    "timestamp": "2024-11-24T10:27:00.000Z",
    "createdAt": "2024-11-24T10:27:00.345Z"
  }
]
```

## Formato de Envío desde Arduino

El dispositivo Arduino debe enviar datos en el siguiente formato JSON:

```json
{
  "deviceId": "baby_01",
  "decibels": 75.5,
  "timestamp": "2024-11-24T10:30:45.123Z"
}
```

### Ejemplo de Código Arduino (ESP8266/ESP32)

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char* azureFunctionUrl = "https://YOUR_FUNCTION_APP.azurewebsites.net/api/ReceiveNoiseData";

void sendNoiseData(float decibels) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    WiFiClient client;
    
    http.begin(client, azureFunctionUrl);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["deviceId"] = "baby_01";
    doc["decibels"] = decibels;
    doc["timestamp"] = getISOTimestamp();
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  }
}
```

## Índices Recomendados

El contenedor usa automáticamente indexación de Cosmos DB. Para optimización adicional:

- Índice en `/timestamp` para queries ordenadas por fecha
- Índice en `/deviceId` (ya es partition key)
- Índice en `/decibels` para filtros por nivel de ruido

## Límites del Tier Gratuito

- **Serverless**: Pay-per-use (primeros 1M RU/mes gratis)
- **Almacenamiento**: Primeros 25 GB gratis
- **Operaciones**: Hasta 2000 RU/s por contenedor

## Queries Comunes

### Obtener últimas 50 lecturas
```sql
SELECT * FROM c 
ORDER BY c.timestamp DESC 
OFFSET 0 LIMIT 50
```

### Obtener lecturas por dispositivo
```sql
SELECT * FROM c 
WHERE c.deviceId = 'baby_01' 
ORDER BY c.timestamp DESC 
OFFSET 0 LIMIT 50
```

### Obtener lecturas con ruido alto
```sql
SELECT * FROM c 
WHERE c.decibels > 70 
ORDER BY c.timestamp DESC
```

### Promedio de decibeles por hora
```sql
SELECT 
  DateTimePart('hour', c.timestamp) as hour,
  AVG(c.decibels) as avgDecibels
FROM c
GROUP BY DateTimePart('hour', c.timestamp)
```

