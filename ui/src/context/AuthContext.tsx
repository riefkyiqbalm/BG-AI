"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthContextType, User } from "../types";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation"; // Gunakan router Next.js untuk navigasi yang halus

const AUTH_USER_KEY = "bgai_auth_user"; // Ubah nama agar lebih konsisten
const AUTH_TOKEN_KEY = "bgai_auth_token";

const defaultAuth: AuthContextType = {
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async (username: string, email: string, password: string) => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuth);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // --- 1. EFEK SAAT PAGE REFRESH ---
  useEffect(() => {
    const validateAndSetUser = async () => {
      // Ambil data dari Cookie (lebih reliabel daripada localStorage untuk Next.js)
      const storedUser = Cookies.get(AUTH_USER_KEY);
      const token = Cookies.get(AUTH_TOKEN_KEY);

      if (storedUser && token) {
        try {
          const parsedStoredUser = JSON.parse(storedUser) as User;

          // Validasi token dengan database
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const dbUser = await response.json();

            // Verifikasi bahwa data cookie cocok dengan database
            const isValid = (
              dbUser.id.toString() === parsedStoredUser.id &&
              dbUser.username === parsedStoredUser.username &&
              dbUser.email === parsedStoredUser.email
            );

            if (isValid) {
              setUser(parsedStoredUser);
            } else {
              // Data tidak cocok, bersihkan dan redirect
              console.warn("User data mismatch between cookie and database");
              Cookies.remove(AUTH_USER_KEY, { path: '/' });
              Cookies.remove(AUTH_TOKEN_KEY, { path: '/' });
              router.push('/login');
            }
          } else {
            // Token tidak valid, bersihkan dan redirect
            console.warn("Invalid token, clearing cookies and redirecting to login");
            Cookies.remove(AUTH_USER_KEY, { path: '/' });
            Cookies.remove(AUTH_TOKEN_KEY, { path: '/' });
            router.push('/login');
          }
        } catch (error) {
          console.error("Error validating user from cookie:", error);
          // Jika ada error (network, parsing, dll), bersihkan dan redirect
          Cookies.remove(AUTH_USER_KEY, { path: '/' });
          Cookies.remove(AUTH_TOKEN_KEY, { path: '/' });
          router.push('/login');
        }
      }
      setLoading(false);
    };

    validateAndSetUser();
  }, [router]);

  // --- 2. FUNGSI LOGIN ---
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      
      const userData: User = {
        id: data.user.id.toString(),
        username: data.user.username,
        email: data.user.email
      };

      // Simpan TOKEN di Cookie (Wajib untuk Middleware)
      Cookies.set(AUTH_TOKEN_KEY, data.token, { expires: 1, path: '/' });

      // Simpan DATA USER di Cookie (Agar awet saat refresh dan terbaca server)
      Cookies.set(AUTH_USER_KEY, JSON.stringify(userData), { expires: 2, path: '/' });
      
      setUser(userData);

      // Gunakan router.push agar transisi ke chat lebih halus (SPA feel)
      router.push('/chat');
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // --- 3. FUNGSI REGISTER ---
  const register = async (username: string, email: string, password: string) => { 
  setLoading(true);
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // KIRIMKAN USERNAME KE BACKEND
      body: JSON.stringify({ username, email, password }) 
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Registration failed');
    }
    
    // Pastikan fungsi login juga dipanggil dengan parameter yang benar 
    // (Jika login hanya butuh email & password, ini sudah benar)
    await login(email, password);

  } catch (error) {
    console.error('Register error:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

  // --- 4. FUNGSI LOGOUT ---
  const logout = () => {
    setUser(null);
    // Hapus semua jejak di Cookie
    Cookies.remove(AUTH_USER_KEY, { path: '/' });
    Cookies.remove(AUTH_TOKEN_KEY, { path: '/' });
    
    // Redirect ke login menggunakan router untuk transisi yang lebih halus
    router.push('/login');
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