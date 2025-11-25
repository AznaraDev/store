import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { BASE_URL } from './Config';

// Crear instancia de axios configurada
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Interceptor de Request - Verifica el token antes de cada petición
axiosInstance.interceptors.request.use(
  (config) => {
    // Obtener userInfo del localStorage
    const userInfoString = localStorage.getItem('userInfo');
    
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        const token = userInfo.token;
        
        if (token) {
          // Decodificar el token para verificar la expiración
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000; // Convertir a segundos
          
          // Verificar si el token está expirado o está por expirar (menos de 1 minuto)
          if (decodedToken.exp < currentTime) {
            // Token expirado
            Swal.fire({
              icon: 'warning',
              title: 'Sesión Expirada',
              text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
              confirmButtonText: 'Ir a Login',
              allowOutsideClick: false,
            }).then(() => {
              // Limpiar localStorage
              localStorage.removeItem('userInfo');
              // Redirigir a login
              window.location.href = '/login';
            });
            
            // Cancelar la petición
            return Promise.reject(new axios.Cancel('Token expirado'));
          }
          
          // Token válido, agregar header de autorización
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        // Si hay error al decodificar, limpiar y redirigir
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
        return Promise.reject(new axios.Cancel('Token inválido'));
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response - Maneja errores 401 como fallback
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si es un error de cancelación, no hacer nada
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    // Verificar si es un error 401
    if (error.response && error.response.status === 401) {
      Swal.fire({
        icon: 'error',
        title: 'No Autorizado',
        text: 'Tu sesión ha expirado o no tienes autorización. Por favor, inicia sesión nuevamente.',
        confirmButtonText: 'Ir a Login',
        allowOutsideClick: false,
      }).then(() => {
        // Limpiar localStorage
        localStorage.removeItem('userInfo');
        // Redirigir a login
        window.location.href = '/login';
      });
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
