import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('safewatch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Server connection error';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (data) => api.post('/auth/signup', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
};

export const alertsAPI = {
  getAlerts: () => api.get('/alerts'),
};


export const bandsAPI = {
  getBands: () => api.get('/bands'),
  getBandById: (id) => api.get(`/bands/${id}`),
  registerBand: (data) => api.post('/bands/register', data),
  updateBand: (id, data) => api.patch(`/bands/${id}`, data),
  deleteBand: (id) => api.delete(`/bands/${id}`),
};

export const locationsAPI = {
  getSafeZones: (bandId) => api.get(`/bands/${bandId}/locations`),
  createSafeZone: (bandId, data) => api.post(`/bands/${bandId}/locations`, data),
  updateSafeZone: (locId, data) => api.patch(`/locations/${locId}`, data),
  deleteSafeZone: (locId) => api.delete(`/locations/${locId}`),
  activateSafeZone: (locId) => api.post(`/locations/${locId}/activate`),
};

export const activityAPI = {
  getLogs: (bandId, params) => api.get(`/bands/${bandId}/activity`, { params }),
  getRecent: (bandId, limit = 3) => api.get(`/bands/${bandId}/activity/recent`, { params: { limit } }),
};

export const sosAPI = {
  triggerSOS: (bandId, payload) => api.post(`/bands/${bandId}/sos`, payload),
  resolveSOS: (bandId, sosEventId) => api.post(`/bands/${bandId}/sos/${sosEventId}/resolve`),
};

export const deviceAPI = {
  ping: (deviceHeader, data) => api.post('/device/ping', data, { headers: { 'x-device-secret': deviceHeader } }),
  sos: (deviceHeader, data) => api.post('/device/sos', data, { headers: { 'x-device-secret': deviceHeader } }),
};

export default api;
