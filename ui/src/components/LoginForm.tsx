"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, register, loading, user } = useAuth();
  const router = useRouter();

  const [activePanel, setActivePanel] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [username, setUsername] = useState("");

  // BUG FIX — was `router.push(\`/chat/${user.id}\`)` called inside useEffect
  // with [user, router] deps. This ran even when loading=true (user not yet
  // resolved from cookie), causing a flash redirect to /chat/undefined.
  // Now we wait for loading to finish before redirecting.
  useEffect(() => {
    if (!loading && user?.id) {
      router.replace(`/chat/${user.id}`);
    }
  }, [user, loading, router]);

  const checkStrength = (val: string) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    setPasswordStrength(score);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login gagal. Periksa kembali akun Anda.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    try {
      await register(username, email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Pendaftaran gagal.");
    }
  };

  const strengthInfo = useMemo(() => {
    const levels = [
      { w: "0%", c: "transparent", t: "" },
      { w: "25%", c: "#ff4d6d", t: "Lemah" },
      { w: "50%", c: "#f5c842", t: "Cukup" },
      { w: "75%", c: "#00d4c8", t: "Kuat" },
      { w: "100%", c: "#3dffa0", t: "Sangat Kuat" },
    ];
    return levels[passwordStrength];
  }, [passwordStrength]);

  // Show nothing while we're resolving the session to avoid flash
  if (loading) {
    return (
      <div style={{ ...S.root, justifyContent: "center" }}>
        <div style={S.bgGrid} />
      </div>
    );
  }

  return (
    <div style={S.root}>
      <div style={S.bgGrid} />
      <div style={S.orb1} />
      <div style={S.orb2} />

      <div style={S.container}>
        {/* Brand */}
        <div style={S.brand}>
          <div style={S.logo}>BG</div>
          <h1 style={S.h1}>BG-AI</h1>
          <p style={S.subH1}>Platform AI Multimodal Pengawasan Gizi</p>
        </div>

        {/* Card */}
        <div style={S.card}>
          {/* Tabs */}
          <div style={S.tabs}>
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setActivePanel(m); setError(""); }}
                style={{ ...S.tabBtn, ...(activePanel === m ? S.tabActive : {}) }}
              >
                {m === "login" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          {error && <div style={S.errorBox}>⚠ {error}</div>}

          <form onSubmit={activePanel === "login" ? handleLogin : handleRegister}>
            {/* Email */}
            <div style={S.inputGroup}>
              <label style={S.label}>Email</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>✉</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email"
                  style={S.input}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Username — register only */}
            {activePanel === "register" && (
              <div style={S.inputGroup}>
                <label style={S.label}>Username</label>
                <div style={S.inputWrap}>
                  <span style={S.inputIcon}>👤</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    style={S.input}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div style={S.inputGroup}>
              <label style={S.label}>Kata Sandi</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (activePanel === "register") checkStrength(e.target.value);
                  }}
                  placeholder="Masukkan kata sandi"
                  style={S.input}
                  required
                  disabled={loading}
                />
                <span onClick={() => setShowPass(!showPass)} style={S.togglePass}>
                  {showPass ? "🙈" : "👁"}
                </span>
              </div>
              {activePanel === "register" && (
                <div style={S.strengthContainer}>
                  <div style={{ ...S.strengthBar, width: strengthInfo.w, background: strengthInfo.c }} />
                  <div style={{ ...S.strengthText, color: strengthInfo.c }}>{strengthInfo.t}</div>
                </div>
              )}
            </div>

            {/* Confirm password — register only */}
            {activePanel === "register" && (
              <div style={S.inputGroup}>
                <label style={S.label}>Konfirmasi Sandi</label>
                <div style={S.inputWrap}>
                  <span style={S.inputIcon}>🔒</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    style={S.input}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} style={S.mainBtn}>
              {loading
                ? "Memproses…"
                : activePanel === "login"
                ? "→ Masuk ke BG-AI"
                : "✦ Buat Akun"}
            </button>
          </form>

          <div style={S.footer}>
            Dengan melanjutkan, Anda menyetujui{" "}
            <a href="/terms" style={S.link}>Ketentuan Layanan</a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: {
    background: "var(--bg)",
    color: "var(--text)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "sans-serif",
  },
  bgGrid: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(0,212,200,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,200,.04) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents: "none",
  },
  orb1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    background: "rgba(0,212,200,.08)",
    top: "-80px",
    right: "10%",
    borderRadius: "50%",
    filter: "blur(80px)",
    animation: "floatOrb 8s ease-in-out infinite",
  },
  orb2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "rgba(0,80,160,.1)",
    bottom: "-50px",
    left: "5%",
    borderRadius: "50%",
    filter: "blur(80px)",
    animation: "floatOrb 8s ease-in-out infinite reverse",
  },
  container: {
    width: "100%",
    maxWidth: "440px",
    padding: "20px",
    position: "relative",
    zIndex: 10,
    animation: "fadeUp 0.6s ease-out",
  },
  brand: { textAlign: "center", marginBottom: "36px" },
  logo: {
    width: "60px",
    height: "60px",
    background: "linear-gradient(135deg, var(--teal), #0070ff)",
    borderRadius: "16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: 700,
    color: "#fff",
    boxShadow: "0 0 30px rgba(0,212,200,.3)",
    marginBottom: "14px",
  },
  h1: { fontSize: "26px", fontWeight: 800, margin: 0 },
  subH1: { color: "var(--muted)", fontSize: "13px", marginTop: "6px" },
  card: {
    background: "var(--panel)",
    border: "1px solid var(--border)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    backdropFilter: "blur(10px)",
  },
  tabs: {
    display: "flex",
    background: "var(--card)",
    borderRadius: "12px",
    padding: "4px",
    marginBottom: "24px",
    gap: "4px",
  },
  tabBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: "none",
    color: "var(--muted)",
    transition: "0.2s",
  },
  tabActive: {
    background: "var(--panel)",
    border: "1px solid var(--border)",
    color: "var(--teal)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  errorBox: {
    background: "rgba(255,77,109,.1)",
    border: "1px solid rgba(255,77,109,.3)",
    color: "#ff4d6d",
    borderRadius: "10px",
    padding: "12px",
    fontSize: "13px",
    marginBottom: "20px",
  },
  inputGroup: { marginBottom: "20px" },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--muted)",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  inputWrap: { position: "relative" },
  inputIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--muted)",
    fontSize: "16px",
  },
  input: {
    width: "100%",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "12px 16px 12px 42px",
    color: "var(--text)",
    fontSize: "14px",
    outline: "none",
    transition: "0.2s",
    boxSizing: "border-box",
  },
  togglePass: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    opacity: 0.7,
  },
  strengthContainer: { marginTop: "8px" },
  strengthBar: { height: "4px", borderRadius: "2px", transition: "0.3s all" },
  strengthText: { fontSize: "10px", textAlign: "right", marginTop: "4px" },
  mainBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, var(--teal), #0080cc)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,212,200,.2)",
    transition: "0.2s",
  },
  footer: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "12px",
    color: "var(--muted)",
  },
  link: { color: "var(--teal)", textDecoration: "none" },
};