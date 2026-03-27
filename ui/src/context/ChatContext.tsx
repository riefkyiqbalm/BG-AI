"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved) as ChatSession[];
        setSessions(data);
        if (data.length > 0) {
          setActiveSessionId(data[0].id);
        }
      } catch {
        localStorage.removeItem(CHAT_STORAGE_KEY);
      }
    } else {
      // Create initial session if none exist
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
          messages: [...session.messages, msg],
        };
      })
    );
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) {
      console.log("[ChatContext] Empty text, skipping");
      return;
    }

    console.log("[ChatContext] ===== sendMessage START =====");
    console.log("[ChatContext] Input text:", text);
    console.log("[ChatContext] activeSessionId:", activeSessionId);
    console.log("[ChatContext] sessions.length:", sessions.length);

    // Use current activeSessionId or create new session
    let targetSessionId = activeSessionId;
    
    // Find OR create session
    let targetSession = sessions.find((s) => s.id === targetSessionId);
    if (!targetSession) {
      console.log("[ChatContext] No active session found, creating new one");
      targetSession = makeSession();
      setSessions([targetSession, ...sessions]);
      setActiveSessionId(targetSession.id);
      targetSessionId = targetSession.id;
    }

    console.log("[ChatContext] Target session:", {
      id: targetSession.id,
      title: targetSession.title,
      messages_count: targetSession.messages.length,
    });

    // Build message list to send to Flask
    // Include all existing messages in this session + new user message
    const messagesToSend: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];

    // Add existing messages from session
    targetSession.messages.forEach((msg) => {
      messagesToSend.push({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.text,
      });
    });

    // Add the new user message
    messagesToSend.push({
      role: "user",
      content: text,
    });

    console.log("[ChatContext] Messages to send to Flask:", messagesToSend.length, "messages");
    console.log("[ChatContext] Message details:", JSON.stringify(messagesToSend, null, 2));

    // VALIDATION: Ensure we have messages
    if (!messagesToSend || messagesToSend.length === 0) {
      console.error("[ChatContext] ERROR: messagesToSend is empty after building!");
      console.error("[ChatContext] targetSession.messages:", targetSession.messages);
      console.error("[ChatContext] text:", text);
      
      // Force at least the user message
      messagesToSend.length = 0; // clear array
      messagesToSend.push({
        role: "user" as const,
        content: text,
      });
      console.log("[ChatContext] FORCED messagesToSend:", messagesToSend);
    }

    // Add user message to UI immediately (optimistic update)
    addMessage(targetSessionId, {
      sessionId: targetSessionId,
      role: "user",
      text,
    });

    // Send to Flask backend
    try {
      console.log("[ChatContext] About to call Flask /api/chat with:", messagesToSend);
      const response: ChatResponse = await sendChat(messagesToSend);
      console.log("[ChatContext] Flask response received:", response);

      if (response.error) {
        console.log("[ChatContext] Error in response, adding error message");
        addMessage(targetSessionId, {
          sessionId: targetSessionId,
          role: "assistant",
          text: `❌ Error (${response.error}): ${response.reply}`,
        });
      } else {
        console.log("[ChatContext] Success, adding AI response");
        addMessage(targetSessionId, {
          sessionId: targetSessionId,
          role: "assistant",
          text: response.reply,
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("[ChatContext] Exception:", errorMsg);
      addMessage(targetSessionId, {
        sessionId: targetSessionId,
        role: "assistant",
        text: `❌ Error: ${errorMsg}\n\nPastikan:\n1. Flask backend berjalan (python main.py di folder log)\n2. LM Studio server sudah dimulai\n3. Model Qwen3-4B dimuat di LM Studio`,
      });
    }

    console.log("[ChatContext] ===== sendMessage END =====\n");
  };

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || null,
    [sessions, activeSessionId]
  );

  const value: ChatContextType = {
    sessions,
    activeSessionId,
    activeSession,
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
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
