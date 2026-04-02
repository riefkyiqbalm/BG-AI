'use client';

import Link from 'next/link';
import React from 'react';
import LogoIcon from './LogoIcon';

export default function AuthTopPanel() {
  return (
    <nav style={S.nav}>
      <LogoIcon />
      <div style={{ flex: 1 }} />
      <Link href='/' style={S.leftLink}>← Kembali ke Chat</Link>
    </nav>
  );
}

const S: Record<string, React.CSSProperties> = {
  nav: {
    height: '58px',
    background: 'var(--panel)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 28px',
    gap: '16px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },

  leftLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: 'var(--muted)',
    fontSize: '13px',
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    transition: 'all .15s',
    cursor: 'pointer',
  }
};
