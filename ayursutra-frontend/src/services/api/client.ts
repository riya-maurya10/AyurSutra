import axios from "axios";

const API_BASE_URL = "http://localhost:9999/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to every authenticated request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized request. JWT may be missing or expired.");
    }

    if (error.response?.status === 403) {
      console.warn("Forbidden request. User does not have permission.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;