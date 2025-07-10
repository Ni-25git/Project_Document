import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3500/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Automatically attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; 