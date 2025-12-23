import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

const existingToken = (() => {
  try {
    return localStorage.getItem('accessToken') || '';
  } catch {
    return '';
  }
})();
if (existingToken) {
  api.defaults.headers.common = { ...api.defaults.headers.common, Authorization: `Bearer ${existingToken}` };
}

api.interceptors.request.use((config) => {
  try {
    const t = localStorage.getItem('accessToken');
    if (t) {
      (api.defaults.headers as any).common = { ...(api.defaults.headers as any).common, Authorization: `Bearer ${t}` };
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized access.');
    }
    return Promise.reject(error);
  }
);
