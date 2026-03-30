// lib/api.ts
// Semua komunikasi ke Flask backend melalui Next.js rewrite proxy (/api/*)

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  reply: string;
  model: string;
  tokens: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error: string | null;
}

export interface StatusResponse {
  status: "online" | "offline";
  models: string[];
  error?: string;
}

export interface ConfigResponse {
  lm_studio_base: string;
  chat_url: string;
  model: string;
  max_tokens: number;
  temperature: number;
}

// ── POST /api/chat ──────────────────────────────────────────
export async function sendChat(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<ChatResponse> {
  console.log("\n[API.sendChat] CALLED");
  console.log("[API.sendChat] messages param:", messages);
  console.log("[API.sendChat] messages.length:", messages?.length);
  console.log("[API.sendChat] systemPrompt:", systemPrompt?.substring(0, 50) || "None");

  if (!messages || messages.length === 0) {
    console.error("[API.sendChat] ERROR: No messages provided!");
    return {
      reply: "Error: No messages to send",
      model: "error",
      tokens: {},
      error: "no_messages",
    };
  }

  const payload = {
    messages,
    ...(systemPrompt ? { system_prompt: systemPrompt } : {}),
  };
  
  console.log("[API.sendChat] Payload to send:", JSON.stringify(payload, null, 2));

  try {
    console.log("[API.sendChat] Fetching /api/chat POST...");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("[API.sendChat] Response status:", res.status);
    const data = await res.json();
    console.log("[API.sendChat] Response data:", data);

    if (!res.ok) {
      return {
        reply: data.reply || data.error || `HTTP ${res.status}`,
        model: "error",
        tokens: {},
        error: data.error || "unknown_error",
      };
    }

    console.log("[API.sendChat] SUCCESS - returning data");
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[API.sendChat] EXCEPTION:", message);
    return {
      reply: message,
      model: "error",
      tokens: {},
      error: "network_error",
    };
  }
}

// ── GET /api/status ─────────────────────────────────────────
export async function getStatus(): Promise<StatusResponse> {
  const res = await fetch("/api/status", { cache: "no-store" });
  if (!res.ok) return { status: "offline", models: [] };
  return res.json();
}

// ── GET /api/models ─────────────────────────────────────────
export async function getModels(): Promise<string[]> {
  const res = await fetch("/api/models", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.models ?? [];
}

// ── GET /api/config ─────────────────────────────────────────
export async function getConfig(): Promise<ConfigResponse | null> {
  const res = await fetch("/api/config", { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}