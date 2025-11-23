import axios from 'axios';

let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// ❗ Asegurar que NO termina en barra
if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1);
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // NECESARIO para que envíe cookies HTTP-only
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug opcional: ver cookies y headers enviados
api.interceptors.request.use((config) => {
  console.log('[API Request]', config.baseURL + config.url);
  return config;
});

export default api;
