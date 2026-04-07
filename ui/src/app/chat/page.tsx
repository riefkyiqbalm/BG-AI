"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useChat } from "@/context/ChatContext";
import { useToast } from "@/context/ToastContext";

import LeftPanel from "@/components/LeftPanel";
import TopPanel from "@/components/TopPanel";
import ChatArea from "@/components/ChatArea";
import ChatInputPanel from "@/components/ChatInputPanel";

import { InputMode, UIMessage } from "@/types";

export default function ChatPage() {
  const {
    activeSession,
    loadingSessionId,
    sendMessage,
    createSession,
  } = useChat();

  const { toast } = useToast();

  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Status loading khusus untuk sesi yang sedang aktif
  const isCurrentLoading = useMemo(() => 
    loadingSessionId !== null && loadingSessionId === activeSession?.id,
    [loadingSessionId, activeSession?.id]
  );

  // Auto scroll ke bawah saat ada pesan baru atau mulai loading
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeSession?.messages, isCurrentLoading]);

  // Handle auto-resize textarea
  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  // Fungsi Kirim Pesan
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isCurrentLoading) return;

    // Jika belum ada sesi, buat otomatis
    if (!activeSession) {
      createSession();
    }

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      await sendMessage(text);
    } catch (err) {
      toast("Gagal terhubung ke AI. Pastikan Flask/LM Studio aktif.", "error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Mengisi input dari Suggestion Cards
  const handleSelectSuggestion = (prompt: string) => {
    setInput(prompt);
    // Memberi sedikit delay agar fokus & resize berjalan setelah state update
    setTimeout(() => {
      textareaRef.current?.focus();
      resizeTextarea();
    }, 50);
  };

  const handleFileUpload = (file: File) => {
    setInput(`[File: ${file.name}] Tolong analisis data dari file ini.`);
    setInputMode("text");
    toast(`File "${file.name}" ditambahkan.`, "info");
  };

  const messages = (activeSession?.messages ?? []) as UIMessage[];
  const isWelcomeScreen = messages.length === 0;

  return (
    <div style={S.root}>
      <LeftPanel />

      <main style={S.main}>
        <TopPanel />

        <ChatArea
          messages={messages}
          isWelcomeScreen={isWelcomeScreen}
          onSelectSuggestion={handleSelectSuggestion}
          isCurrentLoading={isCurrentLoading}
        />

        <ChatInputPanel
          input={input}
          onInput={setInput}
          inputMode={inputMode}
          onModeChange={setInputMode}
          isCurrentLoading={isCurrentLoading}
          onSend={handleSend}
          onFileUpload={handleFileUpload}
          onKeyDown={handleKeyDown}
          textareaRef={textareaRef}
          onResizeTextarea={resizeTextarea}
        />
      </main>

      {/* Global CSS untuk Animasi Typing */}
      <style jsx global>{`
        .dot-blink {
          width: 6px;
          height: 6px;
          background-color: var(--teal);
          border-radius: 50%;
          display: inline-block;
          animation: blink 1.4s infinite ease-in-out both;
        }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }
        .animate-fade-up {
          animation: fadeUp 0.5s ease-out;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    height: "100vh",
    background: "var(--bg)",
    color: "var(--text)",
    overflow: "hidden",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    position: "relative",
  },
  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 5% 40px",
    display: "flex",
    flexDirection: "column",
  },
  welcome: {
    margin: "auto",
    textAlign: "center",
    maxWidth: 600,
    padding: "40px 0",
  },
  welcomeIcon: {
    fontSize: 40,
    background: "rgba(0, 212, 200, 0.1)",
    width: 80,
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    margin: "0 auto 20px",
    border: "1px solid var(--teal)",
  },
  h2: { fontSize: 32, fontWeight: 800, marginBottom: 12 },
  p: { color: "var(--muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 30 },
  messageList: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    maxWidth: 800,
    margin: "0 auto",
    width: "100%",
  },
  typingRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    maxWidth: 800,
    margin: "20px auto 0",
    width: "100%",
  },
  typingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "var(--teal-dim)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
  },
  typingBubble: {
    background: "var(--card)",
    padding: "12px 16px",
    borderRadius: "12px 12px 12px 4px",
    border: "1px solid var(--border)",
    display: "flex",
    gap: 4,
  },
  inputArea: {
    padding: "20px 5% 24px",
    background: "linear-gradient(to top, var(--bg) 80%, transparent)",
  },
  modeRow: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
    justifyContent: "center",
  },
  modeBtn: {
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--muted)",
    cursor: "pointer",
    transition: "0.2s",
  },
  modeBtnActive: {
    background: "rgba(0, 212, 200, 0.1)",
    borderColor: "var(--teal)",
    color: "var(--teal)",
  },
  dropZone: {
    border: "2px dashed var(--border)",
    borderRadius: 12,
    padding: 20,
    textAlign: "center",
    marginBottom: 12,
    maxWidth: 800,
    margin: "0 auto 12px",
    cursor: "pointer",
    color: "var(--muted)",
    fontSize: 13,
  },
  inputContainer: {
    maxWidth: 800,
    margin: "0 auto",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "10px 16px",
    display: "flex",
    alignItems: "flex-end",
    gap: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
  textarea: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    color: "var(--text)",
    fontSize: 15,
    lineHeight: "1.5",
    resize: "none",
    maxHeight: 140,
    padding: "4px 0",
  },
  actionButtons: { display: "flex", gap: 8, alignItems: "center" },
  iconBtn: {
    background: "none",
    border: "none",
    color: "var(--muted)",
    fontSize: 20,
    cursor: "pointer",
    padding: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "var(--teal)",
    color: "white",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.2s",
  },
  sendBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
    filter: "grayscale(1)",
  },
  footerHint: {
    textAlign: "center",
    fontSize: 11,
    color: "var(--muted)",
    marginTop: 12,
  },
};