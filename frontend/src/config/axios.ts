import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // Accediendo a la variable de entorno para el frontend
  timeout: 5000,
  withCredentials: true,  // Habilita el envío de cookies
});

export default axiosInstance;
