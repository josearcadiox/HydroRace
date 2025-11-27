# ⚙️ Configuración de la API

## 📋 ¿Cómo funciona?

La URL de la API **NO está hardcodeada** en el código principal. En su lugar, se carga desde el archivo `config.js` que se ejecuta antes de `app.js`.

---

## 🔧 Archivo de Configuración

**Ubicación:** `frontend/config.js`

Este archivo contiene toda la configuración de la API y se puede modificar sin tocar el código principal.

---

## 🎯 Opciones de Configuración

### **Opción 1: URL Relativa (Por Defecto)**

```javascript
API_BASE_URL: ''  // Usa el mismo dominio del Static Web App
```

**Ventajas:**
- ✅ No requiere configuración
- ✅ Funciona automáticamente en producción
- ✅ Evita problemas de CORS

**Cuándo usar:** Producción en Azure Static Web Apps

---

### **Opción 2: URL Completa Personalizada**

```javascript
API_BASE_URL: 'https://tu-api-custom.azurewebsites.net'
```

**Ventajas:**
- ✅ Permite usar APIs en otro dominio
- ✅ Útil para APIs separadas

**Cuándo usar:** Cuando las APIs están en un Function App separado

---

### **Opción 3: Detección Automática**

El archivo `config.js` detecta automáticamente el entorno:

```javascript
// Si está en azurestaticapps.net → URL relativa
// Si está en localhost → Puedes configurar local
// Por defecto → URL relativa
```

---

## 📝 Cómo Modificar la Configuración

### **Para usar una API en otro dominio:**

1. Abre `frontend/config.js`
2. Modifica la función `getApiBaseUrl()`:

```javascript
function getApiBaseUrl() {
  // Descomenta y modifica esta línea:
  return 'https://tu-api-custom.azurewebsites.net';
  
  // O deja el resto del código para detección automática
}
```

3. Guarda y despliega

---

### **Para desarrollo local:**

```javascript
function getApiBaseUrl() {
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:7071'; // Azure Functions local
  }
  return '';
}
```

---

## 🔍 Estructura del Archivo config.js

```javascript
window.APP_CONFIG = {
  API_BASE_URL: '',        // URL de la API
  USE_MOCK_DATA: false,    // Usar datos de prueba
  REFRESH_INTERVAL: 10000, // Intervalo de actualización (ms)
  DEBUG: false,            // Activar logs de debug
};
```

---

## ✅ Ventajas de esta Implementación

1. **Separación de configuración:** No está mezclada con el código
2. **Fácil de modificar:** Solo editas `config.js`
3. **Detección automática:** Funciona en diferentes entornos
4. **Sin hardcodeo:** La URL no está en `app.js`
5. **Flexible:** Puedes cambiar sin recompilar

---

## 🧪 Cómo Probar

### **1. Verificar configuración actual:**

Abre la consola del navegador (F12) y escribe:
```javascript
console.log(window.APP_CONFIG);
```

### **2. Cambiar URL temporalmente:**

En la consola:
```javascript
window.APP_CONFIG.API_BASE_URL = 'https://otra-api.com';
// Recargar la página
```

### **3. Activar modo debug:**

En `config.js`:
```javascript
DEBUG: true
```

Esto mostrará logs de la configuración cargada.

---

## 📊 Flujo de Carga

```
1. index.html carga
   │
   ▼
2. config.js se ejecuta
   │
   │ Crea window.APP_CONFIG
   │ Detecta URL automáticamente
   │
   ▼
3. app.js se ejecuta
   │
   │ Lee window.APP_CONFIG
   │ Usa API_BASE_URL configurada
   │
   ▼
4. Aplicación funciona
```

---

## 🎯 Ejemplos de Uso

### **Ejemplo 1: API en el mismo dominio (producción)**
```javascript
API_BASE_URL: ''  // → /api/ReceiveNoiseData
```

### **Ejemplo 2: API en otro dominio**
```javascript
API_BASE_URL: 'https://api-ejemplo.azurewebsites.net'
// → https://api-ejemplo.azurewebsites.net/api/ReceiveNoiseData
```

### **Ejemplo 3: Desarrollo local**
```javascript
API_BASE_URL: 'http://localhost:7071'
// → http://localhost:7071/api/ReceiveNoiseData
```

---

## 🔐 Seguridad

- ✅ Las credenciales NO están en el código
- ✅ La URL es pública (no es un secreto)
- ✅ La autenticación se hace en el servidor (Cosmos DB)

---

## 📝 Notas Importantes

1. **CORS:** Si usas una URL de otro dominio, asegúrate de configurar CORS en esa API
2. **HTTPS:** En producción, siempre usa HTTPS
3. **Cache:** Después de cambiar `config.js`, haz hard refresh (Ctrl+Shift+R)

---

**¿Necesitas ayuda para configurar una URL específica?** 🚀

