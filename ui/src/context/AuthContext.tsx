"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthContextType, User } from "../types";

const AUTH_STORAGE_KEY = "bgai_auth_user";
const AUTH_TOKEN_KEY = "bgai_auth_token";

const defaultAuth: AuthContextType = {
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuth);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (stored && token) {
      try {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const fakeUser: User = {
      id: "user_" + Date.now(),
      name: email.split("@")[0],
      email,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fakeUser));
    localStorage.setItem(AUTH_TOKEN_KEY, "fake-token-" + Date.now());
    setUser(fakeUser);
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
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
