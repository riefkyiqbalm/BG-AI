'use client';

import React, { useState } from 'react';
import '../auth.css';

export default function AuthPage() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2800);
  };

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <nav style={{ height: '58px', background: 'var(--panel)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: '16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text)' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,var(--teal),#0070ff)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#fff' }}>B•G</div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '14px', fontWeight: 800 }}>BG-AI <span style={{ color: 'var(--teal)' }}>|</span> NG</div>
        </a>
        <div style={{ flex: 1 }} />
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--muted)', fontSize: '13px', padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border)', transition: 'all .15s', cursor: 'pointer' }}>
          ← Kembali ke Chat
        </a>
      </nav>

      {/* Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: '240px', minWidth: '240px', background: 'var(--panel)', borderRight: '1px solid var(--border)', padding: '28px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '14px 10px 6px' }}>Akun</div>
          {['Profil Saya', 'Keamanan', 'Notifikasi'].map((item, idx) => (
            <a key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: idx === 0 ? 'var(--teal)' : 'var(--muted)', cursor: 'pointer', textDecoration: 'none', transition: 'all .15s', ...(idx === 0 ? { background: 'rgba(0,212,200,.1)', borderLeft: '2px solid var(--teal)', paddingLeft: '10px' } : {}) }}>
              <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>
                {item === 'Profil Saya' && '👤'}
                {item === 'Keamanan' && '🔒'}
                {item === 'Notifikasi' && '🔔'}
              </span>
              {item}
            </a>
          ))}

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '14px 10px 6px' }}>Platform</div>
          {['Model AI', 'Penggunaan & Kuota', 'API Key', 'Tim & Anggota'].map((item, idx) => (
            <a key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'none', transition: 'all .15s' }}>
              <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>
                {item === 'Model AI' && '⬡'}
                {item === 'Penggunaan & Kuota' && '📊'}
                {item === 'API Key' && '🔑'}
                {item === 'Tim & Anggota' && '👥'}
              </span>
              {item}
            </a>
          ))}

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '14px 10px 6px' }}>Lainnya</div>
          <a href="/terms" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'none', transition: 'all .15s' }}>
            <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>⚖</span>
            Ketentuan Layanan
          </a>
          <a onClick={() => { if (confirm('Keluar dari SATU-AI?')) window.location.href = '/login'; }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: 'var(--red)', cursor: 'pointer', textDecoration: 'none', transition: 'all .15s' }}>
            <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>⏏</span>
            Keluar
          </a>
        </aside>

        {/* Content */}
        <div style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', maxWidth: '900px' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>Pengaturan Akun</div>
          <div style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '32px' }}>Kelola profil, keamanan, dan preferensi platform Anda.</div>

          {/* Profile card */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#1a4a7a,#003355)', border: '3px solid var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--teal)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
              RP
              <span style={{ content: "'✎'", position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', borderRadius: '50%', background: 'var(--teal)', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✎</span>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 800, marginBottom: '3px' }}>Riefky Pratama</h3>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '10px' }}>email@example.com · Universitas Teknologi Nusantara</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, background: 'rgba(0,212,200,.12)', border: '1px solid rgba(0,212,200,.3)', color: 'var(--teal)' }}>✦ Admin</span>
                <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, background: 'rgba(0,212,200,.12)', border: '1px solid rgba(0,212,200,.3)', color: 'var(--teal)' }}>🥦 NutriGuard</span>
                <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, background: 'rgba(245,200,66,.12)', border: '1px solid rgba(245,200,66,.3)', color: 'var(--gold)' }}>🏆 LLMGuardians</span>
              </div>
            </div>
          </div>

          {/* Settings card - Informasi Pribadi */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>👤 Informasi Pribadi</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Nama Depan</label>
                <input type="text" defaultValue="Riefky" style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Nama Belakang</label>
                <input type="text" defaultValue="Pratama" style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Email</label>
                <input type="email" defaultValue="email@example.com" style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>No. HP / WA</label>
                <input type="text" defaultValue="0812-3456-7890" style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Institusi / Instansi</label>
              <input type="text" defaultValue="Universitas Teknologi Nusantara" style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Peran / Jabatan</label>
              <select style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }}>
                <option>Admin Sistem & AI Engineer</option>
                <option>Petugas Pengawas Vendor MBG</option>
                <option>Ahli Gizi / Tenaga Kesehatan</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => displayToast('Perubahan berhasil disimpan ✓')} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all .2s', fontFamily: 'var(--font-body)', border: 'none', background: 'linear-gradient(135deg,var(--teal),#0080cc)', color: '#fff', boxShadow: '0 4px 16px rgba(0,212,200,.2)' }}>Simpan Perubahan</button>
              <button style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all .2s', fontFamily: 'var(--font-body)', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}>Batalkan</button>
            </div>
          </div>

          {/* Danger zone */}
          <div style={{ background: 'rgba(255,77,109,.05)', border: '1px solid rgba(255,77,109,.2)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--red)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>⚠ Zona Berbahaya</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>Tindakan berikut bersifat permanen dan tidak dapat dibatalkan.</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => alert('Konfirmasi penghapusan data akan dikirim ke email Anda.')} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all .2s', fontFamily: 'var(--font-body)', border: '1px solid rgba(255,77,109,.3)', background: 'rgba(255,77,109,.1)', color: 'var(--red)' }}>🗑 Hapus Semua Data Chat</button>
              <button onClick={() => { if (confirm('Yakin ingin menghapus akun?')) window.location.href = '/login'; }} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all .2s', fontFamily: 'var(--font-body)', border: '1px solid rgba(255,77,109,.3)', background: 'rgba(255,77,109,.1)', color: 'var(--red)' }}>✕ Hapus Akun Saya</button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div style={{ position: 'fixed', bottom: '28px', right: '28px', background: 'var(--card)', border: '1px solid var(--teal-dim)', color: 'var(--teal)', padding: '12px 20px', borderRadius: '12px', fontSize: '13px', display: 'block', animation: 'fadeUp .3s ease', boxShadow: 'var(--glow)', zIndex: 999 }}>
          {toastMessage}
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
