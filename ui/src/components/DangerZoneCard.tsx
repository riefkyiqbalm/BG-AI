'use client';

import React from 'react';

interface DangerZoneCardProps {
  onDeleteAll?: () => void;
  onDeleteAccount?: () => void;
}

export default function DangerZoneCard({ onDeleteAll, onDeleteAccount }: DangerZoneCardProps) {
  return (
    <div style={S.card}>
      <div style={S.title}>⚠ Zona Berbahaya</div>
      <div style={S.text}>Tindakan berikut bersifat permanen dan tidak dapat dibatalkan.</div>
      <div style={S.buttons}>
        <button onClick={onDeleteAll ?? (() => alert('Konfirmasi penghapusan data akan dikirim ke email Anda.'))} style={S.btnDanger}>🗑 Hapus Semua Data Chat</button>
        <button onClick={onDeleteAccount ?? (() => { if (confirm('Yakin ingin menghapus akun?')) window.location.href = '/login'; })} style={S.btnDanger}>✕ Hapus Akun Saya</button>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  card: { background: 'rgba(255,77,109,.05)', border: '1px solid rgba(255,77,109,.2)', borderRadius: '16px', padding: '24px' },
  title: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--red)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' },
  text: { fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' },
  buttons: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  btnDanger: { padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all .2s', fontFamily: 'var(--font-body)', border: '1px solid rgba(255,77,109,.3)', background: 'rgba(255,77,109,.1)', color: 'var(--red)' },
};
