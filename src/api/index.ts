import api from './client';
import type { Paginated, User } from '../types';

export const studentsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<User>>('/students', { params }).then((r) => r.data),
  get: (id: string) => api.get<User>(`/students/${id}`).then((r) => r.data),
  create: (data: Record<string, unknown>) =>
    api.post<User>('/students', data).then((r) => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch<User>(`/students/${id}`, data).then((r) => r.data),
};

export const teachersApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<User>>('/teachers', { params }).then((r) => r.data),
  create: (data: Record<string, unknown>) =>
    api.post<User>('/teachers', data).then((r) => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch<User>(`/teachers/${id}`, data).then((r) => r.data),
};

export const groupsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/groups', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/groups/${id}`).then((r) => r.data),
  create: (data: Record<string, unknown>) =>
    api.post('/groups', data).then((r) => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/groups/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/groups/${id}`).then((r) => r.data),
  assignStudents: (id: string, studentIds: string[]) =>
    api.patch(`/groups/${id}/students`, { studentIds }).then((r) => r.data),
};

export const responsesApi = {
  list: (formId: string, params?: Record<string, unknown>) =>
    api.get(`/forms/${formId}/responses`, { params }).then((r) => r.data),
  get: (formId: string, responseId: string) =>
    api.get(`/forms/${formId}/responses/${responseId}`).then((r) => r.data),
  submit: (formId: string, answers: { fieldId: string; value: string }[]) =>
    api.post(`/forms/${formId}/responses`, { answers }).then((r) => r.data),
  submitPublic: (
    publicId: string,
    answers: { fieldId: string; value: string }[],
  ) =>
    api
      .post(`/public/forms/${publicId}/responses`, { answers })
      .then((r) => r.data),
  exportUrl: (formId: string, format: 'csv' | 'xlsx') =>
    `${import.meta.env.VITE_API_URL || 'https://form-api.akaikumogo.uz'}/forms/${formId}/responses/export?format=${format}`,
};

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats').then((r) => r.data),
};

export const telegramApi = {
  getConfig: () => api.get('/telegram/config').then((r) => r.data),
  updateConfig: (data: Record<string, unknown>) =>
    api.put('/telegram/config', data).then((r) => r.data),
  test: () => api.post('/telegram/test').then((r) => r.data),
  sendTest: () => api.post('/telegram/send-test').then((r) => r.data),
};

export const auditApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/audit', { params }).then((r) => r.data),
};
