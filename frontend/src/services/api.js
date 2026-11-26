
import axios from "axios";

// ກຳນົດ URL ສຳລັບເຊື່ອມຕໍ່ Backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ເພີ່ມ Token ໃນທຸກ Request ຖ້າມີການ Login
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
