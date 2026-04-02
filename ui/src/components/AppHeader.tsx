'use client';

import React from 'react';
import Link from 'next/link';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  children?: React.ReactNode;
}

export default function AppHeader({ title, subtitle, backHref = '/chat', children }: AppHeaderProps) {
  return (
    <nav style={S.nav}>
      <Link href="/" style={S.navBrand}>
        <div style={S.logo}>BG</div>
        <span style={S.brandText}>{title || 'BG-AI'}</span>
      </Link>

      <div style={S.rightSection}>
        {subtitle && <span style={S.subtitle}>{subtitle}</span>}
        <Link href={backHref} style={S.backBtn}>← Kembali</Link>
      </div>

      {children}
    </nav>
  );
}

const S: Record<string, React.CSSProperties> = {
  nav: {
    height: '60px',
    background: 'var(--panel)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: 'var(--text)',
  },
  logo: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, var(--teal), #0070ff)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
    color: '#fff',
  },
  brandText: {
    fontFamily: 'var(--font-head)',
    fontSize: '16px',
    fontWeight: 800,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--muted)',
  },
  backBtn: {
    padding: '8px 16px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--muted)',
    fontSize: '13px',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
};
