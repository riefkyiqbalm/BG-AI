"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthContextType, User } from "../types";
// Import js-cookie untuk memudahkan manajemen cookie
// Install dulu: npm install js-cookie && npm install --save-dev @types/js-cookie
import Cookies from "js-cookie";

const AUTH_STORAGE_KEY = "bgai_auth_user";
const AUTH_TOKEN_KEY = "bgai_auth_token";

const defaultAuth: AuthContextType = {
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuth);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek di localStorage (untuk data user) dan Cookie (untuk token/middleware)
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    const token = Cookies.get(AUTH_TOKEN_KEY);

    if (stored && token) {
      try {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      } catch {
        logout(); // Bersihkan jika data korup
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      
      const userData: User = {
        id: data.user.id.toString(),
        name: data.user.username,
        email: data.user.username
      };

      // 1. Simpan Token di COOKIE agar bisa dibaca Middleware
      // expires: 1 berarti 1 hari
      Cookies.set(AUTH_TOKEN_KEY, data.token, { expires: 1, path: '/' });

      // 2. Simpan profil di LocalStorage
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      // Auto-login setelah register berhasil
      await login(username, password);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    Cookies.remove(AUTH_TOKEN_KEY, { path: '/' });
    // Opsional: arahkan ke login setelah logout
    window.location.href = '/login';
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}