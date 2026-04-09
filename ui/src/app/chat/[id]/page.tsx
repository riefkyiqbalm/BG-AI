"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useChat } from "@/context/ChatContext";
import { useToast } from "@/context/ToastContext";
import { useParams } from "next/navigation";

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
  const params = useParams();

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

  const sendMsg = async (messageText: string) => {
  let currentSessionId = params.id; // Ambil ID dari URL jika ada

  // JIKA TIDAK ADA ID di URL, berarti ini pesan pertama (Sesi Baru)
  if (!currentSessionId) {
    try {
      // 1. Buat Sesi Baru di database
      const res = await fetch('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ 
          title: messageText.substring(0, 30) // Judul diambil dari potongan pesan pertama
        }),
      });
      const newSession = await res.json();
      currentSessionId = newSession.id;

      // 2. Update URL secara silent agar user sekarang berada di dalam sesi tersebut
      // Tanpa mereload halaman
      window.history.pushState(null, '', `/chat/${currentSessionId}`);
    } catch (err) {
      console.error("Gagal membuat sesi baru");
      return;
    }
  }

  // 3. Setelah Sesi ada (Baru atau Lama), simpan pesannya
 try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: currentSessionId,
        text: messageText,
        role: 'user' // atau 'human'
      }),
    });

    if (!res.ok) throw new Error("Gagal menyimpan pesan");
    
    // Update UI chat di sini (tambah pesan ke state)
  } catch (error) {
    console.error("Error saving message:", error);
  }

};

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
  }};