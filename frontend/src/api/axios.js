import axios from 'axios';

const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const apiBaseUrl = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:5000/api' : '/api');

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
});

// Attach JWT token from localStorage automatically
axiosInstance.interceptors.request.use((config) => {
  const user = localStorage.getItem('bloodDonorUser');
  if (user) {
    try {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      localStorage.removeItem('bloodDonorUser');
    }
  }
  return config;
});

export default axiosInstance;
