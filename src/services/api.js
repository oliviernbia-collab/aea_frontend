import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aea_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aea_token');
      localStorage.removeItem('aea_user');
      if (!window.location.pathname.startsWith('/connexion')) {
        window.location.href = '/connexion';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
