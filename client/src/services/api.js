import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const API = axios.create({
  baseURL: "https://theadbook-backend.vercel.app/api",
  withCredentials: true,
  timeout: 10000, 
});

// Request interceptor to attach JWT token securely
API.interceptors.request.use(
  (config) => {
    // 1. Try getting token from Zustand store first
    let token = useAuthStore.getState().token;

    // 2. Fallback: Directly read from localStorage if Zustand hasn't hydrated yet
    if (!token) {
      try {
        const authStorage = JSON.parse(
          localStorage.getItem("theadbook-auth-storage"),
        );
        token = authStorage?.state?.token;
      } catch (e) {
        console.error("Error reading auth storage:", e);
      }
    }

    // Attach Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default API;
