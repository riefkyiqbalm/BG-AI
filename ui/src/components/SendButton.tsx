'use client';

import React from 'react';

interface SendButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function SendButton({ onClick, disabled = false }: SendButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...S.sendBtn,
        ...(disabled ? S.sendBtnDisabled : {}),
      }}
      type="button"
    >
      ➤
    </button>
  );
}

const S: Record<string, React.CSSProperties> = {
  sendBtn: { width: 42, height: 42, borderRadius: 12, border: 'none', background: 'var(--teal)', color: '#fff', cursor: 'pointer' },
  sendBtnDisabled: { background: 'var(--border)', cursor: 'not-allowed' },
};
