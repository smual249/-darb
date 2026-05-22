import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config';

const API = axios.create({
  baseURL: Config.API_URL,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('darb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('darb_token');
      await AsyncStorage.removeItem('darb_user');
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
  update: (data) => API.put('/auth/me', data),
};

export const emails = {
  getAuthUrl: () => API.get('/emails/auth-url'),
  callback: (data) => API.post('/emails/callback', data),
  fetch: () => API.get('/emails/fetch'),
  list: (params) => API.get('/emails', { params }),
  get: (id) => API.get(`/emails/${id}`),
  markRead: (id) => API.post(`/emails/${id}/read`),
  generateReply: (id) => API.post(`/emails/${id}/generate-reply`),
  approveReply: (id, data) => API.post(`/emails/${id}/approve-reply`, data),
  updateSettings: (data) => API.put('/emails/settings', data),
};

export const telegram = {
  botInfo: () => API.get('/telegram/bot-info'),
  connect: (data) => API.post('/telegram/connect', data),
  messages: (params) => API.get('/telegram/messages', { params }),
  approve: (id, data) => API.post(`/telegram/messages/${id}/approve`, data),
  updateSettings: (data) => API.put('/telegram/settings', data),
};

export const whatsapp = {
  connect: (data) => API.post('/whatsapp/connect', data),
  messages: (params) => API.get('/whatsapp/messages', { params }),
  approve: (id, data) => API.post(`/whatsapp/messages/${id}/approve`, data),
  send: (data) => API.post('/whatsapp/send', data),
  updateSettings: (data) => API.put('/whatsapp/settings', data),
};

export const tasks = {
  list: (params) => API.get('/tasks', { params }),
  create: (data) => API.post('/tasks', data),
  get: (id) => API.get(`/tasks/${id}`),
  update: (id, data) => API.put(`/tasks/${id}`, data),
  delete: (id) => API.delete(`/tasks/${id}`),
  complete: (id) => API.post(`/tasks/${id}/complete`),
  dismissReminder: (id) => API.post(`/tasks/${id}/dismiss-reminder`),
  organize: (data) => API.post('/tasks/organize', data),
};

export default API;
