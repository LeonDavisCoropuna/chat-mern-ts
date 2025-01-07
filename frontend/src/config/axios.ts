import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 5000,
  withCredentials: true,  // Habilita el envío de cookies
});

export default axiosInstance;
