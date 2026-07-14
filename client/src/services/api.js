import axios from "axios";

let apiBaseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Proactively append /api if the user forgot it in their Vercel environment variables
if (apiBaseURL && !apiBaseURL.endsWith("/api") && !apiBaseURL.endsWith("/api/")) {
  apiBaseURL = apiBaseURL.endsWith("/") ? `${apiBaseURL}api` : `${apiBaseURL}/api`;
}

const API = axios.create({
  baseURL: apiBaseURL,
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;