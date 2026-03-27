'use client';

import React, { useState } from 'react';
import '../login.css';

export default function LoginPage() {
  const [activePanel, setActivePanel] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showError, setShowError] = useState(false);
  const [regPass, setRegPass] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassLogin, setShowPassLogin] = useState(false);
  const [showPassReg, setShowPassReg] = useState(false);

  const checkStrength = (val: string) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    setPasswordStrength(score);
  };

  const doLogin = () => {
    if (!loginEmail || !loginPass) {
      setShowError(true);
      return;
    }
    setShowError(false);
    // Simulate login
    window.location.href = '/';
  };

  const doRegister = () => {
    // Simulate register
    window.location.href = '/';
  };

  const getStrengthInfo = () => {
    const levels = [
      { w: '0%', c: 'transparent', t: '' },
      { w: '25%', c: '#ff4d6d', t: 'Lemah' },
      { w: '50%', c: '#f5c842', t: 'Cukup' },
      { w: '75%', c: '#00d4c8', t: 'Kuat' },
      { w: '100%', c: '#3dffa0', t: 'Sangat Kuat' },
    ];
    return levels[passwordStrength];
  };

  const strength = getStrengthInfo();

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Grid background */}
      <div style={{ content: "''", position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,200,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,200,.04) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

      {/* Orbs */}
      <div style={{ position: 'fixed', width: '400px', height: '400px', background: 'rgba(0,212,200,.08)', top: '-80px', right: '10%', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', animation: 'floatOrb 8s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', width: '300px', height: '300px', background: 'rgba(0,80,160,.1)', bottom: 0, left: '5%', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', animationDelay: '-4s' }} />

      <style>{`
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
      `}</style>

      {/* Login wrap */}
      <div style={{ width: '100%', maxWidth: '440px', padding: '20px', position: 'relative', zIndex: 10, animation: 'fadeUp .5s ease' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--teal), #0070ff)', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: '#fff', boxShadow: '0 0 30px rgba(0,212,200,.3)', marginBottom: '14px' }}>BG</div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '26px', fontWeight: 800 }}>BG-AI</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px' }}>Platform AI Multimodal Pengawasan Gizi & Vendor MBG</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '20px', padding: '36px 32px', boxShadow: 'var(--glow)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--card)', borderRadius: '10px', padding: '4px', marginBottom: '28px', gap: '4px' }}>
            <button onClick={() => setActivePanel('login')} style={{ flex: 1, padding: '9px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textAlign: 'center', cursor: 'pointer', border: activePanel === 'login' ? '1px solid var(--border)' : 'none', background: activePanel === 'login' ? 'var(--panel)' : 'none', color: activePanel === 'login' ? 'var(--teal)' : 'var(--muted)', transition: 'all .2s', fontFamily: 'var(--font-body)' }}>Masuk</button>
            <button onClick={() => setActivePanel('register')} style={{ flex: 1, padding: '9px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textAlign: 'center', cursor: 'pointer', border: activePanel === 'register' ? '1px solid var(--border)' : 'none', background: activePanel === 'register' ? 'var(--panel)' : 'none', color: activePanel === 'register' ? 'var(--teal)' : 'var(--muted)', transition: 'all .2s', fontFamily: 'var(--font-body)' }}>Daftar</button>
          </div>

          {/* LOGIN PANEL */}
          {activePanel === 'login' && (
            <div>
              {showError && (
                <div style={{ background: 'rgba(255,77,109,.1)', border: '1px solid rgba(255,77,109,.3)', color: 'var(--red)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>⚠ Email atau kata sandi salah. Coba lagi.</div>
              )}

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '7px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Email / ID Institusi</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '15px', pointerEvents: 'none' }}>✉</span>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="nama@institusi.go.id" style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px 12px 42px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none', transition: 'all .2s' }} />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '7px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Kata Sandi</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '15px', pointerEvents: 'none' }}>🔒</span>
                  <input type={showPassLogin ? 'text' : 'password'} value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="Masukkan kata sandi" style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 42px 12px 42px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none', transition: 'all .2s' }} />
                  <span onClick={() => setShowPassLogin(!showPassLogin)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', cursor: 'pointer', fontSize: '15px', transition: 'color .15s' }}>
                    {showPassLogin ? '🙈' : '👁'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--teal)', width: '14px', height: '14px' }} />
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Ingat saya</span>
                </label>
                <a href="#" style={{ fontSize: '12px', color: 'var(--teal)', textDecoration: 'none' }}>Lupa kata sandi?</a>
              </div>

              <button onClick={doLogin} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, var(--teal), #0080cc)', color: '#fff', border: 'none', borderRadius: '12px', fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all .2s', boxShadow: '0 4px 20px rgba(0,212,200,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>→</span> Masuk ke SATU-AI
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0', color: 'var(--muted)', fontSize: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                atau masuk dengan
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              <button onClick={() => alert('SSO Pemerintah: Fitur segera hadir')} style={{ width: '100%', padding: '12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                🏛 SSO Pemerintah (SIMAN)
              </button>
              <button onClick={() => alert('Google SSO: Coming soon')} style={{ width: '100%', padding: '12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                ◉ Google Workspace
              </button>
            </div>
          )}

          {/* REGISTER PANEL */}
          {activePanel === 'register' && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '7px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Nama Lengkap</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '15px', pointerEvents: 'none' }}>👤</span>
                  <input type="text" placeholder="Nama sesuai KTP" style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px 12px 42px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '7px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Email Institusi</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '15px', pointerEvents: 'none' }}>✉</span>
                  <input type="email" placeholder="nama@institusi.go.id" style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px 12px 42px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '7px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Kata Sandi</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '15px', pointerEvents: 'none' }}>🔒</span>
                  <input type={showPassReg ? 'text' : 'password'} value={regPass} onChange={(e) => { setRegPass(e.target.value); checkStrength(e.target.value); }} placeholder="Min. 8 karakter" style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 42px 12px 42px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} />
                  <span onClick={() => setShowPassReg(!showPassReg)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', cursor: 'pointer', fontSize: '15px' }}>
                    {showPassReg ? '🙈' : '👁'}
                  </span>
                </div>
                <div style={{ marginTop: '6px' }}>
                  <div style={{ height: '3px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '99px', width: strength.w, background: strength.c, transition: 'width .3s, background .3s' }} />
                  </div>
                  <div style={{ fontSize: '10px', color: strength.c, marginTop: '4px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{strength.t}</div>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '7px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Konfirmasi Kata Sandi</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '15px', pointerEvents: 'none' }}>🔒</span>
                  <input type="password" placeholder="Ulangi kata sandi" style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px 12px 42px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '7px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Peran / Instansi</label>
                <select style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }}>
                  <option value="">Pilih peran Anda</option>
                  <option>Petugas Pengawas Vendor MBG</option>
                  <option>Ahli Gizi / Tenaga Kesehatan</option>
                  <option>Admin Dinas Pendidikan</option>
                  <option>Vendor MBG</option>
                  <option>Peneliti / Akademisi</option>
                </select>
              </div>

              <button onClick={doRegister} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, var(--teal), #0080cc)', color: '#fff', border: 'none', borderRadius: '12px', fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all .2s', boxShadow: '0 4px 20px rgba(0,212,200,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                ✦ Buat Akun
              </button>
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: 'var(--muted)' }}>
            Dengan melanjutkan, Anda menyetujui <a href="/terms" style={{ color: 'var(--teal)', textDecoration: 'none' }}>Ketentuan Layanan</a> dan <a href="/terms" style={{ color: 'var(--teal)', textDecoration: 'none' }}>Kebijakan Privasi</a> kami.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
