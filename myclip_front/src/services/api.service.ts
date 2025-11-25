// myclip_front/src/services/api.service.ts
import axios from 'axios';

let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Asegurar que NO termina en barra
if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1);
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // NECESARIO para que envíe cookies HTTP-only
  // NO establecer Content-Type global aquí. Para JSON se puede poner por petición.
});

// Debug opcional: ver requests (url, method, headers) antes de enviar
api.interceptors.request.use((config) => {
  try {
    console.log('[API Request]', config.method?.toUpperCase(), config.baseURL + (config.url || ''), 'headers:', config.headers);
  } catch (e) {
    console.log('[API Request] (log error)', e);
  }
  return config;
});

export default api;
