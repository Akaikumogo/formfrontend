import api from './client';
import type { FormAssignment, FormField, FormItem, Paginated } from '../types';

export const formsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<FormItem>>('/forms', { params }).then((r) => r.data),
  get: (id: string) => api.get<FormItem>(`/forms/${id}`).then((r) => r.data),
  create: (data: Partial<FormItem>) =>
    api.post<FormItem>('/forms', data).then((r) => r.data),
  update: (id: string, data: Partial<FormItem>) =>
    api.patch<FormItem>(`/forms/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/forms/${id}`).then((r) => r.data),
  publish: (id: string) => api.post(`/forms/${id}/publish`).then((r) => r.data),
  close: (id: string) => api.post(`/forms/${id}/close`).then((r) => r.data),
  archive: (id: string) => api.post(`/forms/${id}/archive`).then((r) => r.data),
  duplicate: (id: string) =>
    api.post<FormItem>(`/forms/${id}/duplicate`).then((r) => r.data),
  addField: (id: string, data: Partial<FormField>) =>
    api.post<FormField>(`/forms/${id}/fields`, data).then((r) => r.data),
  updateField: (id: string, fieldId: string, data: Partial<FormField>) =>
    api.patch<FormField>(`/forms/${id}/fields/${fieldId}`, data).then((r) => r.data),
  deleteField: (id: string, fieldId: string) =>
    api.delete(`/forms/${id}/fields/${fieldId}`).then((r) => r.data),
  reorderFields: (id: string, orderedIds: string[]) =>
    api
      .patch<FormField[]>(`/forms/${id}/fields/reorder`, { orderedIds })
      .then((r) => r.data),
  assignments: (id: string) =>
    api.get<FormAssignment[]>(`/forms/${id}/assignments`).then((r) => r.data),
  assign: (id: string, data: { studentId?: string; groupId?: string }) =>
    api.post(`/forms/${id}/assignments`, data).then((r) => r.data),
  removeAssignment: (id: string, assignmentId: string) =>
    api.delete(`/forms/${id}/assignments/${assignmentId}`).then((r) => r.data),
  getPublic: (publicId: string) =>
    api.get(`/public/forms/${publicId}`).then((r) => r.data),
  overview: (id: string) =>
    api.get(`/forms/${id}/overview`).then((r) => r.data),
  offerToGroup: (id: string, data: { groupId: string; note?: string }) =>
    api.post(`/forms/${id}/offers`, data).then((r) => r.data),
  listOffers: (params?: { status?: string }) =>
    api.get('/form-offers', { params }).then((r) => r.data),
  acceptOffer: (id: string) =>
    api.post(`/form-offers/${id}/accept`).then((r) => r.data),
  rejectOffer: (id: string) =>
    api.post(`/form-offers/${id}/reject`).then((r) => r.data),
};

export const notificationsApi = {
  list: () => api.get('/notifications/inbox').then((r) => r.data),
  unreadCount: () =>
    api.get<{ count: number }>('/notifications/inbox/unread-count').then((r) => r.data),
  markRead: (id: string) =>
    api.patch(`/notifications/inbox/${id}/read`).then((r) => r.data),
  markAllRead: () =>
    api.post('/notifications/inbox/read-all').then((r) => r.data),
};
