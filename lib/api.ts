import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Inject token otomatis & app-key
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = Cookies.get("token");
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // App-key must always be present
  if (process.env.NEXT_PUBLIC_APP_KEY) {
    config.headers.set("app-key", process.env.NEXT_PUBLIC_APP_KEY);
  }

  return config;
});

// Penanganan Error Global (Logout jika 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        Cookies.remove("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
