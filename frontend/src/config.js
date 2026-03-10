// Configuración automática para desarrollo local y nube

const getApiUrl = () => {
  const hostname = window.location.hostname;
  
  // Si es Render o Vercel (producción), usar la API en la nube
  if (hostname.includes('onrender.com') || hostname.includes('vercel.app')) {
    return 'https://barberia-h4vd.onrender.com/api';
  }
  
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
