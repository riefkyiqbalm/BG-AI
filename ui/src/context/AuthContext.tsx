"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import type { AuthContextType, Role, User } from "@/types";

const AUTH_USER_KEY = "bgai_auth_user";
const AUTH_TOKEN_KEY = "bgai_auth_token";

// ─── Cookie options ──────────────────────────────────────────────────────────
// BUG FIX #1 — token expiry was 1 day but user cookie was 2 days.
// On day 2 the user cookie existed but the token was gone → white-screen loop.
// Both are now 7 days and kept in sync.
const COOKIE_OPTS: Cookies.CookieAttributes = {
  expires: 7,   // days
  path: "/",
  sameSite: "Lax",
  // secure: true  ← uncomment when deploying to HTTPS
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function saveAuthCookies(token: string, user: User) {
  Cookies.set(AUTH_TOKEN_KEY, token, COOKIE_OPTS);
  Cookies.set(AUTH_USER_KEY, JSON.stringify(user), COOKIE_OPTS);
}

function clearAuthCookies() {
  Cookies.remove(AUTH_TOKEN_KEY, { path: "/" });
  Cookies.remove(AUTH_USER_KEY, { path: "/" });
}

function parseUserCookie(): User | null {
  try {
    const raw = Cookies.get(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
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
  // BUG FIX #2 — was initialised as null, so every refresh started in
  // "logged-out" state and triggered a redirect before the useEffect ran.
  // Now we read the cookie synchronously so the initial state is correct.
  const [user, setUser] = useState<User | null>(() => parseUserCookie());
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ── Logout (defined before useEffect so it can be called inside it) ────────
  // BUG FIX #3 — logout was defined AFTER the useEffect that called it, so
  // the closure captured an undefined reference on first render.
  const logout = useCallback(() => {
    setUser(null);
    clearAuthCookies();
    router.push("/login");
  }, [router]);

  // ── Validate session on mount / refresh ────────────────────────────────────
  useEffect(() => {
    const validate = async () => {
      const token = Cookies.get(AUTH_TOKEN_KEY);

      // No token → definitely not logged in, stop loading immediately.
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          // 401 = token expired/invalid → clean up and redirect
          logout();
          return;
        }

        const dbUser = await res.json();

        const fresh: User = {
          id:          dbUser.id.toString(),
          name:        dbUser.name        ?? "",
          email:       dbUser.email,
          image:       dbUser.image       ?? "",
          contact:     dbUser.contact     ?? "",
          institution: dbUser.institution ?? "",
          role:        dbUser.role as Role,
          createdAt:   dbUser.createdAt,
        };

        // Keep cookies in sync with latest DB data
        Cookies.set(AUTH_USER_KEY, JSON.stringify(fresh), COOKIE_OPTS);
        setUser(fresh);
      } catch (err) {
        console.error("[AuthContext] validate error:", err);
        // Network error — keep the locally cached user so the UI doesn't
        // flash a redirect. Loading is still resolved below.
      } finally {
        setLoading(false);
      }
    };

    validate();
    // BUG FIX #4 — dependency array had [router] which caused the effect to
    // re-run every navigation, triggering rapid duplicate /api/auth/me calls.
    // Empty array = run once on mount, which is the correct behaviour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login gagal");

      const userData: User = {
        id:          data.user.id.toString(),
        name:        data.user.name        ?? "",
        email:       data.user.email,
        image:       data.user.image       ?? "",
        contact:     data.user.contact     ?? "",
        institution: data.user.institution ?? "",
        role:        data.user.role as Role,  // "USER" | "ASSISTANT" from schema enum
        createdAt:   data.user.createdAt,
      };

      saveAuthCookies(data.token, userData);
      setUser(userData);

      // Navigate after state is committed
      router.push(`/chat/${userData.id}`);
    } catch (err) {
      console.error("[AuthContext] login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Pendaftaran gagal");
        }

        // Auto-login after successful registration
        await login(email, password);
      } catch (err) {
        console.error("[AuthContext] register error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [login]
  );

  // BUG FIX #5 — useMemo dependency array was [user, loading] which excluded
  // login/register/logout. Any time those callbacks changed (e.g. after router
  // stabilised) the context value became stale and consumers got the old fns.
  const value = useMemo<AuthContextType>(
    () => ({ user, loading, isAuthenticated: !!user, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}