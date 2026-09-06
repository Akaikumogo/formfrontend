import api from './client';
import type { User } from '../types';

export async function login(email: string, password: string) {
  const { data } = await api.post<{ accessToken: string; user: User }>('/auth/login', {
    email,
    password,
  });
  return data;
}

export async function registerTeacher(payload: Record<string, unknown>) {
  const { data } = await api.post<{ accessToken: string; user: User }>(
    '/auth/register',
    payload,
  );
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function completeOnboarding() {
  const { data } = await api.post<User>('/auth/onboarding/complete');
  return data;
}
