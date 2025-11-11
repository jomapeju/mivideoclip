import axios from 'axios';
import Cookies from 'js-cookie';

// TODO: 1. Definir la URL base del Backend
const API_URL = 'http://localhost:3000/api/v1/'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Peticiones: Añade el token JWT antes de enviar la solicitud
api.interceptors.request.use(
  (config) => {
    // Obtener el token almacenado (lo llamaremos 'auth_token')
    const token = Cookies.get('auth_token'); 

    if (token) {
      // Si existe, lo adjuntamos al encabezado Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de Respuestas (Opcional, pero recomendado para manejar 401/Logout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el servidor responde con 401 (Unauthorized/Token Expirado)
        if (error.response?.status === 401) {
            // Eliminar el token y redirigir al Login
            Cookies.remove('auth_token');
            // Nota: La redirección real se haría con el router de Next.js
            console.log("Token expirado o inválido. Redirigiendo a Login...");
            // router.push('/login'); 
        }
        return Promise.reject(error);
    }
);


export default api;