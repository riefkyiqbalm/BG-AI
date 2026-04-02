'use client';

import React from 'react';
import { InputMode } from '@/types';
import MultiModal from './MultiModal';
import SendButton from './SendButton';
import AttachButton from './AttachButton';

interface ChatInputPanelProps {
  input: string;
  onInput: (value: string) => void;
  inputMode: InputMode;
  onModeChange: (mode: InputMode) => void;
  isCurrentLoading: boolean;
  onSend: () => void;
  onFileUpload: (file: File) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onResizeTextarea: () => void;
}

export default function ChatInputPanel({
  input,
  onInput,
  inputMode,
  onModeChange,
  isCurrentLoading,
  onSend,
  onFileUpload,
  onKeyDown,
  textareaRef,
  onResizeTextarea,
}: ChatInputPanelProps) {
  return (
    <div style={S.inputArea}>
      <MultiModal inputMode={inputMode} onModeChange={onModeChange} />

      {inputMode !== 'text' && (
        <div style={S.dropZone} onClick={() => document.getElementById('file-up')?.click()}>
          <span>☁️ Klik untuk upload {inputMode}</span>
          <input id="file-up" type="file" style={{ display: 'none' }} onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileUpload(file);
          }} />
        </div>
      )}

      <div style={S.inputContainer}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            onInput(e.target.value);
            onResizeTextarea();
          }}
          onKeyDown={onKeyDown}
          placeholder="Tanyakan sesuatu..."
          rows={1}
          style={S.textarea}
          disabled={isCurrentLoading}
        />

        <div style={S.actionButtons}>
          <AttachButton onClick={() => document.getElementById('file-up')?.click()} />
          <SendButton onClick={onSend} disabled={isCurrentLoading || !input.trim()} />
        </div>
      </div>

      <div style={S.footerHint}>
        BG-AI · AI Bisa Salah Harap Cek Kembali. <a href="/terms" style={{ color: 'var(--teal)' }}>Terms of Service</a>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  inputArea: { padding: '20px 5% 24px', background: 'linear-gradient(to top, var(--bg) 80%, transparent)' },
  dropZone: { padding: '12px 14px', borderRadius: 12, border: '1px dashed var(--border)', marginBottom: 12, cursor: 'pointer', textAlign: 'center', color: 'var(--muted)' },
  inputContainer: { display: 'flex', alignItems: 'flex-end', gap: 8 },
  textarea: { width: '100%', minHeight: '38px', maxHeight: '140px', resize: 'none', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 12px', background: 'var(--card)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none', lineHeight: 1.4 },
  actionButtons: { display: 'flex', alignItems: 'center', gap: 8 },
  footerHint: { marginTop: 10, color: 'var(--muted)', fontSize: 12, textAlign: 'center' },
};
