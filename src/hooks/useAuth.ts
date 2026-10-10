'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { useAuthContext } from '@/lib/auth-context';

export function useAuth() {
  const { user, loading, login: authLogin, logout: authLogout, refresh } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && typeof window !== 'undefined') {
      // Don't redirect on auth pages
    }
  }, [loading, user]);

  async function login(email: string, password: string) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (response.ok) {
        authLogin(result.data?.token);
        router.push('/customer/dashboard');
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (err) {
      throw err;
    }
  }

  async function logout() {
    await authLogout();
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    refresh,
  };
}

export function useOptionalAuth() {
  const { user, loading } = useAuthContext();
  return { user, loading };
}
