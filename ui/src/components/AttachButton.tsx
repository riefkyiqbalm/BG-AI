'use client';

import React from 'react';

interface AttachButtonProps {
  onClick: () => void;
}

export default function AttachButton({ onClick }: AttachButtonProps) {
  return (
    <button style={S.iconBtn} onClick={onClick} type="button">
      📎
    </button>
  );
}

const S: Record<string, React.CSSProperties> = {
  iconBtn: { width: 42, height: 42, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', cursor: 'pointer' },
};
