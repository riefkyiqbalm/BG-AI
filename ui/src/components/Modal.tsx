import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

export default function Modal({ isOpen, onClose, onConfirm, message }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          fontFamily: 'var(--font-head)',
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '16px',
          color: 'var(--text)'
        }}>
          Konfirmasi
        </div>
        <div style={{
          fontSize: '14px',
          color: 'var(--muted)',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          {message}
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all .15s',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)'
            }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all .15s',
              border: 'none',
              background: 'var(--red)',
              color: '#fff'
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}