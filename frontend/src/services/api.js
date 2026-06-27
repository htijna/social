import axios from 'axios';

const BACKEND_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
const API_PREFIX = import.meta.env.PROD ? '/_/backend/api' : '/api';

const api = axios.create({
  baseURL: `${BACKEND_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add JWT token to headers if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
};

export const complaintAPI = {
  create: (formData) => api.post('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  update: (id, data) => api.put(`/complaints/${id}`, data),
  delete: (id) => api.delete(`/complaints/${id}`)
};

export const departmentAPI = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`)
};

export const userAPI = {
  getAll: () => api.get('/users'),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationsRead: () => api.put('/users/notifications/mark-read')
};

export { BACKEND_URL };
export const ASSETS_URL = import.meta.env.PROD ? '/_/backend' : 'http://localhost:5000';
export const BACKEND_PREFIX = import.meta.env.PROD ? '/_/backend' : '';
export default api;
