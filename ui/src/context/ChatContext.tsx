"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ChatContextType, ChatMessage, ChatSession } from "../types";
import { sendChat, ChatResponse } from "../lib/api";

const CHAT_STORAGE_KEY = "bgai_chat_sessions";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

function makeSession(name?: string): ChatSession {
  const now = new Date().toISOString();
  return {
    id: `session_${Date.now()}`,
    title: name || `Sesi Chat ${new Date().toLocaleString()}`,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null); // State loading per session

  useEffect(() => {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved) as ChatSession[];
        setSessions(data);
        if (data.length > 0) setActiveSessionId(data[0].id);
      } catch {
        localStorage.removeItem(CHAT_STORAGE_KEY);
      }
    } else {
      const initialSession = makeSession("Sesi Pertama");
      setSessions([initialSession]);
      setActiveSessionId(initialSession.id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const createSession = (name?: string) => {
    const s = makeSession(name);
    setSessions((prev) => [s, ...prev]);
    setActiveSessionId(s.id);
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    if (activeSessionId === sessionId) {
      const next = sessions.find((s) => s.id !== sessionId);
      setActiveSessionId(next?.id || "");
    }
  };

  const setActiveSession = (sessionId: string) => {
    if (sessions.some((s) => s.id === sessionId)) {
      setActiveSessionId(sessionId);
    }
  };

  const addMessage = (
    sessionId: string,
    payload: Omit<ChatMessage, "id" | "createdAt">,
  ) => {
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
          messages: [...session.messages, msg],
        };
      }),
    );
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const targetSessionId = activeSessionId;

    // --- FIX 1: ANTI DOUBLE SEND (GUARD) ---
    if (loadingSessionId === targetSessionId) {
      console.log("[ChatContext] Session busy, ignoring duplicate send");
      return;
    }

    // --- FIX 2: SET LOADING HANYA UNTUK SESSION INI ---
    setLoadingSessionId(targetSessionId);

    // Update Judul Sesi jika pesan pertama
    const currentSession = sessions.find(s => s.id === targetSessionId);
    if (currentSession && currentSession.messages.length === 0) {
      setSessions(prev => prev.map(s => 
        s.id === targetSessionId 
          ? { ...s, title: text.substring(0, 30) + (text.length > 30 ? "..." : "") } 
          : s
      ));
    }

    // Bangun list pesan untuk dikirim ke backend
    const messagesToSend = (currentSession?.messages || []).map(msg => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.text
    }));
    messagesToSend.push({ role: "user", content: text });

    // Tambah pesan user ke UI (Optimistic)
    addMessage(targetSessionId, {
      sessionId: targetSessionId,
      role: "user",
      text,
    });

    try {
      const response: ChatResponse = await sendChat(messagesToSend);
      
      if (response.error) {
        addMessage(targetSessionId, {
          sessionId: targetSessionId,
          role: "assistant",
          text: `❌ Error (${response.error}): ${response.reply}`,
        });
      } else {
        addMessage(targetSessionId, {
          sessionId: targetSessionId,
          role: "assistant",
          text: response.reply,
        });
      }
    } catch (err: any) {
      addMessage(targetSessionId, {
        sessionId: targetSessionId,
        role: "assistant",
        text: `❌ Error: ${err.message || "Gagal menghubungi backend"}`,
      });
    } finally {
      // --- FIX 3: RELEASE LOADING ---
      setLoadingSessionId(null);
    }
  };

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || null,
    [sessions, activeSessionId],
  );

  // --- FIX 4: MASUKKAN loadingSessionId KE VALUE PROVIDER ---
  const value: ChatContextType = {
    sessions,
    activeSessionId,
    activeSession,
    loadingSessionId, // Sekarang UI bisa baca ini
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