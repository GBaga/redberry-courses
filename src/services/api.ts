import axios from "axios";

export const API_BASE_URL = "https://api.redclass.redberryinternship.ge/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Configure token on the client side
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally handle generic auth errors natively here (e.g., logout on 401)
    return Promise.reject(error);
  }
);
