import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '').replace(/\/api$/, '');

export const TOKEN_KEY = 'agenda_token';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 90000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error, fallback = 'Algo deu errado. Tente novamente.') {
  if (!error) return fallback;
  if (error.code === 'ECONNABORTED') return 'A requisição demorou demais. Tente novamente.';
  if (!error.response) return 'Não foi possível conectar ao servidor. Verifique a VITE_API_URL e se o backend está no ar.';
  const detail = error.response.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length) {
    return detail
      .map((d) => {
        const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : '';
        return field ? `${field}: ${d.msg}` : d.msg;
      })
      .join(' • ');
  }
  return fallback;
}

export default api;
