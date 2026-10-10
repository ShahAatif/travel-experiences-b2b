'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch session');
      const result = await res.json();
      setUser(result.data);
      return result.data as User | null;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function login(token: string) {
    setUser(null);
    setLoading(true);
    const nextUser = await checkAuth();
    if (nextUser && pathname.startsWith('/auth/')) {
      router.push(nextUser.role === 'AGENCY' || nextUser.role === 'ADMIN' ? '/agency/dashboard' : '/customer/dashboard');
    }
  }

  async function logout() {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        router.push('/auth/login');
      }
    } catch (error) {
      setUser(null);
      router.push('/auth/login');
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout, refresh: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
}
