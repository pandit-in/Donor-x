import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
