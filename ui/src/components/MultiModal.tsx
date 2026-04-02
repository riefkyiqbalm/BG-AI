'use client';

import React from 'react';
import { InputMode } from '@/types';

interface MultiModalProps {
  inputMode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

export default function MultiModal({ inputMode, onModeChange }: MultiModalProps) {
  return (
    <div style={S.modeRow}>
      {(['text', 'foto', 'video', 'dokumen'] as InputMode[]).map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          style={{ ...S.modeBtn, ...(inputMode === mode ? S.modeBtnActive : {}) }}
          type="button"
        >
          {mode === 'text' && '✏️ Teks'}
          {mode === 'foto' && '📸 Foto'}
          {mode === 'video' && '🎬 Video'}
          {mode === 'dokumen' && '📄 Dokumen'}
        </button>
      ))}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  modeRow: { display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'center' },
  modeBtn: { padding: '6px 12px', borderRadius: 20, fontSize: 12, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', transition: '0.2s' },
  modeBtnActive: { background: 'rgba(0, 212, 200, 0.1)', borderColor: 'var(--teal)', color: 'var(--teal)' },
};
