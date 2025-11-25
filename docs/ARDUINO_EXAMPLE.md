# Código de Ejemplo para Arduino

## Configuración del Hardware

### Componentes Necesarios
- ESP8266 o ESP32
- Sensor de sonido (ej: KY-037, MAX4466, o MAX9814)
- Cables de conexión
- Fuente de alimentación

### Conexiones

```
Sensor de Sonido    →    ESP8266/ESP32
─────────────────────────────────────
VCC                 →    3.3V
GND                 →    GND
OUT (Analog)        →    A0 (ESP8266) o GPIO34 (ESP32)
```

## Código Completo para ESP8266

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>

const char* ssid = "TU_WIFI_SSID";
const char* password = "TU_WIFI_PASSWORD";
const char* azureFunctionUrl = "https://YOUR_FUNCTION_APP.azurewebsites.net/api/ReceiveNoiseData";

const int soundSensorPin = A0;
const String deviceId = "baby_01";

const int SAMPLE_WINDOW = 50;
const int SEND_INTERVAL = 5000;
const int NOISE_THRESHOLD = 50;

unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  delay(100);
  
  pinMode(soundSensorPin, INPUT);
  
  Serial.println("\n\nBaby Monitor IoT - Iniciando...");
  
  connectToWiFi();
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  
  Serial.println("Sistema listo!");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }
  
  float decibels = measureNoise();
  
  Serial.print("Nivel de ruido: ");
  Serial.print(decibels);
  Serial.println(" dB");
  
  unsigned long currentTime = millis();
  if (currentTime - lastSendTime >= SEND_INTERVAL || decibels > NOISE_THRESHOLD) {
    sendNoiseData(decibels);
    lastSendTime = currentTime;
  }
  
  delay(1000);
}

void connectToWiFi() {
  Serial.println();
  Serial.print("Conectando a WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nError al conectar WiFi. Reintentando...");
    delay(5000);
    connectToWiFi();
  }
}

float measureNoise() {
  unsigned long startMillis = millis();
  int peakToPeak = 0;
  unsigned int signalMax = 0;
  unsigned int signalMin = 1024;
  
  while (millis() - startMillis < SAMPLE_WINDOW) {
    unsigned int sample = analogRead(soundSensorPin);
    
    if (sample < 1024) {
      if (sample > signalMax) {
        signalMax = sample;
      } else if (sample < signalMin) {
        signalMin = sample;
      }
    }
  }
  
  peakToPeak = signalMax - signalMin;
  
  double volts = (peakToPeak * 3.3) / 1024;
  double decibels = map(peakToPeak, 20, 900, 40, 90);
  
  decibels = constrain(decibels, 30, 110);
  
  return decibels;
}

void sendNoiseData(float decibels) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi no conectado. No se puede enviar datos.");
    return;
  }
  
  WiFiClient client;
  HTTPClient http;
  
  Serial.println("\nEnviando datos a Azure...");
  
  if (http.begin(client, azureFunctionUrl)) {
    http.addHeader("Content-Type", "application/json");
    
    String timestamp = getISOTimestamp();
    
    StaticJsonDocument<200> doc;
    doc["deviceId"] = deviceId;
    doc["decibels"] = decibels;
    doc["timestamp"] = timestamp;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    Serial.print("JSON: ");
    Serial.println(jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      
      String response = http.getString();
      Serial.println("Response: " + response);
      
      if (httpResponseCode == 201) {
        Serial.println("✓ Datos enviados exitosamente!");
      }
    } else {
      Serial.print("Error en HTTP POST: ");
      Serial.println(http.errorToString(httpResponseCode));
    }
    
    http.end();
  } else {
    Serial.println("Error: No se pudo conectar al servidor");
  }
}

String getISOTimestamp() {
  time_t now = time(nullptr);
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  
  char buffer[25];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  
  return String(buffer);
}
```

## Código para ESP32

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>

const char* ssid = "TU_WIFI_SSID";
const char* password = "TU_WIFI_PASSWORD";
const char* azureFunctionUrl = "https://YOUR_FUNCTION_APP.azurewebsites.net/api/ReceiveNoiseData";

const int soundSensorPin = 34;
const String deviceId = "baby_01";

const int SAMPLE_WINDOW = 50;
const int SEND_INTERVAL = 5000;
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  delay(100);
  
  pinMode(soundSensorPin, INPUT);
  
  Serial.println("\n\nBaby Monitor IoT - Iniciando...");
  
  connectToWiFi();
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  
  Serial.println("Sistema listo!");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }
  
  float decibels = measureNoise();
  
  Serial.print("Nivel de ruido: ");
  Serial.print(decibels);
  Serial.println(" dB");
  
  unsigned long currentTime = millis();
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    sendNoiseData(decibels);
    lastSendTime = currentTime;
  }
  
  delay(1000);
}

void connectToWiFi() {
  Serial.println();
  Serial.print("Conectando a WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

float measureNoise() {
  unsigned long startMillis = millis();
  int peakToPeak = 0;
  unsigned int signalMax = 0;
  unsigned int signalMin = 4095;
  
  while (millis() - startMillis < SAMPLE_WINDOW) {
    unsigned int sample = analogRead(soundSensorPin);
    
    if (sample < 4095) {
      if (sample > signalMax) {
        signalMax = sample;
      } else if (sample < signalMin) {
        signalMin = sample;
      }
    }
  }
  
  peakToPeak = signalMax - signalMin;
  
  double volts = (peakToPeak * 3.3) / 4095;
  double decibels = map(peakToPeak, 20, 900, 40, 90);
  
  decibels = constrain(decibels, 30, 110);
  
  return decibels;
}

void sendNoiseData(float decibels) {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }
  
  HTTPClient http;
  
  http.begin(azureFunctionUrl);
  http.addHeader("Content-Type", "application/json");
  
  String timestamp = getISOTimestamp();
  
  StaticJsonDocument<200> doc;
  doc["deviceId"] = deviceId;
  doc["decibels"] = decibels;
  doc["timestamp"] = timestamp;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.print("Enviando: ");
  Serial.println(jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.print("Response: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

String getISOTimestamp() {
  time_t now = time(nullptr);
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  
  char buffer[25];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  
  return String(buffer);
}
```

## Librerías Requeridas

En Arduino IDE, instalar:

1. **ESP8266WiFi** (para ESP8266) o **WiFi** (para ESP32)
2. **ArduinoJson** by Benoit Blanchon
3. **ESP8266HTTPClient** o **HTTPClient**

### Instalación

```
Arduino IDE → Sketch → Include Library → Manage Libraries
Buscar: "ArduinoJson"
Instalar versión 6.x
```

## Calibración del Sensor

Para calibrar el sensor de ruido:

1. Colocar el sensor en un ambiente tranquilo
2. Leer valores mínimos (baseline)
3. Crear ruido fuerte (aplausos, etc.)
4. Ajustar los valores en la función `map()`:

```cpp
double decibels = map(peakToPeak, MIN_VALUE, MAX_VALUE, 40, 90);
```

## Troubleshooting

### Error de Conexión WiFi
- Verificar SSID y contraseña
- Asegurar que el router esté en 2.4GHz (no 5GHz)
- Acercar el dispositivo al router

### Valores Inconsistentes del Sensor
- Verificar conexiones
- Agregar capacitor de 100µF entre VCC y GND
- Usar cables cortos

### Error HTTP 400
- Verificar formato JSON
- Verificar que todos los campos requeridos estén presentes
- Verificar formato de timestamp

### Error HTTP 500
- Verificar que la Azure Function esté desplegada
- Verificar que Cosmos DB esté configurado
- Revisar logs en Azure Portal

