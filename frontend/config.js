/**
 * Configuración de la API
 * 
 * Este archivo permite configurar la URL de la API sin modificar el código principal.
 * 
 * Opciones:
 * 1. Dejar vacío ('') para usar URL relativa (mismo dominio)
 * 2. Especificar URL completa para usar API en otro dominio
 * 3. Usar detección automática basada en el hostname
 */

(function() {
  'use strict';

  // Detectar automáticamente la URL base
  function getApiBaseUrl() {
    // Opción 1: URL personalizada (descomenta y modifica si necesitas)
    // return 'https://tu-api-custom.azurewebsites.net';
    
    // Opción 2: Detección automática
    const hostname = window.location.hostname;
    
    // Si estamos en Azure Static Web Apps, usar URL relativa
    if (hostname.includes('azurestaticapps.net')) {
      return ''; // URL relativa - usa el mismo dominio
    }
    
    // Si estamos en localhost, puedes usar Functions local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Descomenta para desarrollo local:
      // return 'http://localhost:7071';
      return ''; // Por defecto, URL relativa
    }
    
    // Por defecto, usar URL relativa
    return '';
  }

  // Configuración global
  window.APP_CONFIG = {
    // URL base de la API (vacío = relativa, o URL completa)
    API_BASE_URL: getApiBaseUrl(),
    
    // Usar datos mock (para desarrollo/testing)
    USE_MOCK_DATA: false,
    
    // Intervalo de actualización automática (milisegundos)
    REFRESH_INTERVAL: 10000, // 10 segundos
    
    // Configuración adicional
    DEBUG: false, // Activar logs de debug
  };

  // Log de configuración (solo en modo debug)
  if (window.APP_CONFIG.DEBUG) {
    console.log('🔧 Configuración cargada:', window.APP_CONFIG);
    console.log('🌐 API Base URL:', window.APP_CONFIG.API_BASE_URL || '(URL relativa)');
  }
})();

