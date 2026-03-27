export type Role = "user" | "assistant" | "system";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: Role;
  text: string;
  createdAt: string;
}

export interface UIMessage extends ChatMessage {
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface LMStatus {
  online: boolean;
  model: string;
  requestsPerMin: number;
  latencyMs: number;
  lastChecked: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface ChatContextType {
  sessions: ChatSession[];
  activeSessionId: string;
  activeSession: ChatSession | null;
  createSession: (name?: string) => void;
  setActiveSession: (sessionId: string) => void;
  addMessage: (sessionId: string, message: Omit<ChatMessage, "id" | "createdAt">) => void;
  sendMessage: (text: string) => Promise<void>;
  deleteSession: (sessionId: string) => void;
}
