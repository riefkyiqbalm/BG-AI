'use_client';

import React from 'react';
import Link from 'next/link';
import { log } from 'node:console';

export default function LogoIcon() {
  return (
    <Link href='/' style={S.brandAnchor}>
        <div style={S.logo}>B•G</div>
        <div style={S.brandText}>BG-AI</div>
      </Link>
  );
}
const S: Record<string, React.CSSProperties> = {
 brandAnchor: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: 'var(--text)',
  },
  logo: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg,var(--teal),#0070ff)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 700,
    color: '#fff',
  },
  brandText: {
    fontFamily: 'var(--font-head)',
    fontSize: '14px',
    fontWeight: 800,
  },
}