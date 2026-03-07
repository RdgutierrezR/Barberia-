// Configuración automática para desarrollo local y producción

const getApiUrl = () => {
  // Producción: usar variable de entorno o URL de Render
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const hostname = window.location.hostname;
  
  // Si es localhost o 127.0.0.1, usar localhost:5000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // Si es acceso desde red local, usar la misma IP del navegador en puerto 5000
  return `http://${hostname}:5000/api`;
};

const CONFIG = {
  FRONTEND_URL: window.location.origin,
  API_URL: getApiUrl()
};

console.log('API_URL configurado:', CONFIG.API_URL);

export const API_URL = CONFIG.API_URL;
export const FRONTEND_URL = CONFIG.FRONTEND_URL;
