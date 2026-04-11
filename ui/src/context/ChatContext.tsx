"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ChatContextType, ChatMessage, ChatSession } from "@/types";
import { useRouter } from "next/navigation"; 

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  // FIX: Pindahkan useRouter ke tingkat komponen atas
  const router = useRouter();

  // Load awal dari Database via API (Bukan localStorage lagi agar sinkron antar perangkat)
  useEffect(() => {
    const fetchSessions = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/chat/sessions", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions);
          if (data.sessions.length > 0) setActiveSessionId(data.sessions[0].id);
        }
      } catch (err) {
        console.error("Gagal memuat sesi chat:", err);
      }
    };
    fetchSessions();
  }, []);

  const createSession = async () => {
    try {
      const token = localStorage.getItem("token"); 
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Gagal membuat sesi");

      const data = await response.json();
      const newUuid = data.session.id;

      setSessions((prev) => [data.session, ...prev]);
      setActiveSessionId(newUuid);

      // Navigasi setelah sesi terbuat di DB
      router.push(`/chat/${newUuid}`);
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Maaf, gagal membuat chat baru.");
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setSessions((prev) => prev.filter((session) => session.id !== sessionId));
        if (activeSessionId === sessionId) {
          const next = sessions.find((s) => s.id !== sessionId);
          setActiveSessionId(next?.id || "");
          router.push(next ? `/chat/${next.id}` : '/chat');
        }
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const setActiveSession = (sessionId: string) => {
    if (sessions.some((s) => s.id === sessionId)) {
      setActiveSessionId(sessionId);
    }
  };

  const addMessage = (sessionId: string, payload: Omit<ChatMessage, "id" | "createdAt">) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const msg: ChatMessage = {
          ...payload,
          id: `${sessionId}_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        return {
          ...session,
          updatedAt: new Date().toISOString(),
          messages: [...(session.messages || []), msg],
        };
      })
    );
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !activeSessionId) return;

    const targetSessionId = activeSessionId;

    if (loadingSessionId === targetSessionId) return;
    setLoadingSessionId(targetSessionId);

    // Update judul otomatis jika ini pesan pertama
    const currentSession = sessions.find(s => s.id === targetSessionId);
    if (currentSession && (!currentSession.messages || currentSession.messages.length === 0)) {
      const newTitle = text.substring(0, 30) + (text.length > 30 ? "..." : "");
      setSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, title: newTitle } : s));
      
      // Update judul di database (Background process)
      const token = localStorage.getItem("token");
      fetch(`/api/chat/sessions/${targetSessionId}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle })
      });
    }

    // Optimistic Update: Tampilkan pesan user langsung
    addMessage(targetSessionId, { sessionId: targetSessionId, role: "user", text });

    try {
      const token = localStorage.getItem("token");
      // Kirim pesan ke API Endpoint Message yang baru
      const response = await fetch(`/api/chat/sessions/${targetSessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: text }) // Kirim parameter "message" saja
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Gagal mendapatkan respon API");

      // Tampilkan pesan dari AI
      addMessage(targetSessionId, {
        sessionId: targetSessionId,
        role: "assistant",
        text: data.response.text, // Pastikan field "text" sesuai dengan DB Message Anda
      });

    } catch (err: any) {
      addMessage(targetSessionId, {
        sessionId: targetSessionId,
        role: "assistant",
        text: `❌ Error: ${err.message || "Gagal menghubungi backend"}`,
      });
    } finally {
      setLoadingSessionId(null);
    }
  };

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || null,
    [sessions, activeSessionId]
  );

  const value: ChatContextType = {
    sessions,
    activeSessionId,
    activeSession,
    loadingSessionId,
    createSession,
    setActiveSession,
    addMessage,
    sendMessage,
    deleteSession,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}