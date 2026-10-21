import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Add the saved JWT to every API request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Return a useful API error message for forms and page alerts.
export function getErrorMessage(error) {
  return error.response?.data?.error || "Something went wrong. Please try again.";
}

export default api;
