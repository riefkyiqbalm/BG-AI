'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import './page.css';

export default function ChatPage() {
  // Mengambil state dan fungsi dari ChatContext
  const { activeSession, sendMessage, createSession, setActiveSession, sessions } = useChat();
  // Mengambil data user dari AuthContext
  const { user } = useAuth();
  
  const [currentMode, setCurrentMode] = useState('nutri');
  const [isWaiting, setIsWaiting] = useState(false);
  const [inputMode, setInputMode] = useState('text');
  const [lmStatus, setLmStatus] = useState('offline');
  
  const msgInputRef = useRef<HTMLTextAreaElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interval untuk mengecek status API
  useEffect(() => {
    const timer = setInterval(() => checkStatus(), 30000);
    checkStatus();
    return () => clearInterval(timer);
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setLmStatus(data.status === 'online' ? 'online' : 'offline');
    } catch (e) {
      setLmStatus('offline');
    }
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const fillPrompt = (text: string) => {
    if (msgInputRef.current) {
      msgInputRef.current.value = text;
      autoResize(msgInputRef.current);
      msgInputRef.current.focus();
    }
  };

  const handleFile = (input: HTMLInputElement) => {
    if (input.files?.[0]) {
      const f = input.files[0];
      const size = (f.size / 1024).toFixed(1);
      if (msgInputRef.current) {
        msgInputRef.current.value = `[File: ${f.name} (${size} KB)] Analisis file ini.`;
        autoResize(msgInputRef.current);
      }
    }
  };

  const handleSendMessage = async () => {
    if (isWaiting || !msgInputRef.current) return;
    const text = msgInputRef.current.value.trim();
    if (!text) return;

    msgInputRef.current.value = '';
    msgInputRef.current.style.height = 'auto';
    setIsWaiting(true);

    try {
      await sendMessage(text); // Memanggil fungsi sendMessage dari ChatContext
    } catch (err) {
      console.error("[ChatPage] Send error:", err);
    } finally {
      setIsWaiting(false);
    }

    setTimeout(() => {
      if (chatAreaRef.current) {
        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
      }
    }, 100);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#060d1a', color: '#e8eef6', fontFamily: 'DM Sans, sans-serif' }}>
      
      {/* SIDEBAR - Riwayat Sesi */}
      <aside style={{ width: '260px', minWidth: '260px', background: '#0c1828', borderRight: '1px solid #1a3050', display: 'flex', flexDirection: 'column', padding: '20px 14px', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px 16px', borderBottom: '1px solid #1a3050' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #00d4c8, #0070ff)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>B•G</div>
          <div style={{ fontSize: '15px', fontWeight: 800 }}>BG-AI <span style={{ color: '#00d4c8' }}>|</span> NG</div>
        </div>

        <button onClick={() => createSession()} style={{ background: 'linear-gradient(135deg, #00897f, #004f6e)', color: '#fff', border: 'none', borderRadius: '14px', padding: '10px', cursor: 'pointer', fontWeight: 600 }}>
          ✦ Chat Baru
        </button>

        <div style={{ fontSize: '10px', color: '#5a7a99', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '8px' }}>Riwayat Sesi</div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sessions.map((s) => (
            <div 
              key={s.id} 
              onClick={() => setActiveSession(s.id)} // Menggunakan setActiveSessionId dari context
              style={{ 
                padding: '10px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer',
                background: activeSession?.id === s.id ? '#0f2035' : 'transparent',
                color: activeSession?.id === s.id ? '#00d4c8' : '#5a7a99',
                borderLeft: activeSession?.id === s.id ? '2px solid #00d4c8' : 'none'
              }}
            >
              {s.title}
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: '56px', background: '#0c1828', borderBottom: '1px solid #1a3050', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <div style={{ fontWeight: 800, flex: 1 }}>BG-AI Analyzer</div>
          {user && <span style={{ fontSize: '12px', color: '#5a7a99', marginRight: '15px' }}>Halo, {user.name}</span>}
          <span style={{ color: '#00d4c8', fontSize: '10px' }}>● {lmStatus.toUpperCase()}</span>
        </div>

        <div ref={chatAreaRef} style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {!activeSession || activeSession.messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '500px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 800 }}>Selamat datang di <span style={{ color: '#00d4c8' }}>BG-AI</span></h2>
              <p style={{ color: '#5a7a99', marginTop: '10px' }}>Mulai analisis gizi atau verifikasi vendor sekarang.</p>
            </div>
          ) : (
            activeSession.messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ padding: '12px 16px', borderRadius: '14px', maxWidth: '80%', background: msg.role === 'user' ? 'rgba(0,212,200,0.1)' : '#0f2035', border: '1px solid #1a3050' }}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* INPUT SECTION */}
        <div style={{ borderTop: '1px solid #1a3050', padding: '20px', background: '#0c1828' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', background: '#0f2035', borderRadius: '16px', padding: '10px' }}>
            <textarea
              ref={msgInputRef}
              onKeyDown={handleKey}
              onInput={(e) => autoResize(e.currentTarget)}
              placeholder="Tanya sesuatu..."
              style={{ flex: 1, background: 'none', border: 'none', color: '#e8eef6', resize: 'none', outline: 'none' }}
            />
            <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>📎</button>
            <button onClick={handleSendMessage} disabled={isWaiting} style={{ background: '#00d4c8', border: 'none', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer' }}>➤</button>
          </div>
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={(e) => handleFile(e.currentTarget)} />
        </div>
      </main>
    </div>
  );
}