import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMe, login as loginApi } from '../api/auth';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  acceptSession: (accessToken: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (!token) queryClient.removeQueries({ queryKey: ['me'] });
  }, [token, queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginApi(email, password);
      localStorage.setItem('accessToken', res.accessToken);
      setToken(res.accessToken);
      queryClient.setQueryData(['me'], res.user);
      return res.user;
    },
    [queryClient],
  );

  const acceptSession = useCallback(
    (accessToken: string, nextUser: User) => {
      localStorage.setItem('accessToken', accessToken);
      setToken(accessToken);
      queryClient.setQueryData(['me'], nextUser);
    },
    [queryClient],
  );

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['me'] });
  }, [queryClient]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user: token ? user ?? null : null,
      loading: !!token && isLoading,
      login,
      acceptSession,
      logout,
      refreshUser,
      isAuthenticated: !!token && !!user,
    }),
    [token, user, isLoading, login, acceptSession, logout, refreshUser],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
