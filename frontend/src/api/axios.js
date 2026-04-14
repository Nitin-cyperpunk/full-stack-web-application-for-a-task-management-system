import axios from 'axios';

const base = (import.meta.env.VITE_SERVER_URL || '').replace(/\/$/, '');

export const api = axios.create({
  baseURL: `${base}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const hadAuth = err.config?.headers?.Authorization;
    if (err.response?.status === 401 && hadAuth) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
