import React from 'react';
import LogOut from './LogOut';

export default function AuthLeftPanel() {
  return (
    <aside id='authLeftPanel' style={{ width: '240px', minWidth: '240px', background: 'var(--panel)', borderRight: '1px solid var(--border)', padding: '28px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
      <LogOut />
    </aside>
  );
}