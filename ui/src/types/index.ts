// src/types/index.ts

// ── Roles ─────────────────────────────────────────────────────

export type Role = "user" | "assistant" | "system";

// ── User ──────────────────────────────────────────────────────

export interface User {
  id:    string;
  username:  string;
  email: string;
  contact: string;
  role: Role;
  institution: string;
  createdAt: string;
}

// ── Chat Messages ─────────────────────────────────────────────

export interface ChatMessage {
  id:        string;
  sessionId: string;
  role:      Role;
  text:      string;
  createdAt: string;
}

export interface UIMessage extends ChatMessage {
  isStreaming?: boolean;
}

// ── Chat Session ──────────────────────────────────────────────

export interface ChatSession {
  id:        string;
  title:     string;
  createdAt: string;
  updatedAt: string;
  messages:  ChatMessage[];
}

// ── LM Studio Status ──────────────────────────────────────────

export interface LMStatus {
  online:         boolean;
  model:          string;
  requestsPerMin: number;
  latencyMs:      number;
  lastChecked:    string;
}

// ── Auth Context ──────────────────────────────────────────────

export interface AuthContextType {
  user:            User | null;
  isAuthenticated: boolean;
  loading:         boolean;
  login:           (username: string, password: string) => Promise<void>;
  register:        (email: string, username: string, password: string) => Promise<void>;
  logout:          () => void;
}

// ── Chat Context ──────────────────────────────────────────────

export interface ChatContextType {
  sessions:        ChatSession[];
  activeSessionId: string;
  activeSession:   ChatSession | null;
  loadingSessionId: string | null; // ID sesi yang sedang loading, atau null jika tidak ada
  createSession:   (name?: string) => void;
  setActiveSession:(sessionId: string) => void;
  addMessage:      (sessionId: string, message: Omit<ChatMessage, "id" | "createdAt">) => void;
  sendMessage:     (text: string) => Promise<void>;
  deleteSession:   (sessionId: string) => void;
  
}

// ── Input Mode (digunakan di app/chat/page.tsx) ───────────────

/** Mode input bar di halaman chat */
export type InputMode = "text" | "foto" | "video" | "dokumen";