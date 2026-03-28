(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/context/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const AUTH_STORAGE_KEY = "bgai_auth_user";
const AUTH_TOKEN_KEY = "bgai_auth_token";
const defaultAuth = {
    user: null,
    isAuthenticated: false,
    loading: true,
    login: async ()=>{},
    logout: ()=>{}
};
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(defaultAuth);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const stored = localStorage.getItem(AUTH_STORAGE_KEY);
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (stored && token) {
                try {
                    const parsed = JSON.parse(stored);
                    setUser(parsed);
                } catch  {
                    localStorage.removeItem(AUTH_STORAGE_KEY);
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                }
            }
            setLoading(false);
        }
    }["AuthProvider.useEffect"], []);
    const login = async (email, password)=>{
        setLoading(true);
        await new Promise((resolve)=>setTimeout(resolve, 500));
        const fakeUser = {
            id: "user_" + Date.now(),
            name: email.split("@")[0],
            email
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fakeUser));
        localStorage.setItem(AUTH_TOKEN_KEY, "fake-token-" + Date.now());
        setUser(fakeUser);
        setLoading(false);
    };
    const logout = ()=>{
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
    };
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AuthProvider.useMemo[value]": ()=>({
                user,
                loading,
                isAuthenticated: !!user,
                login,
                logout
            })
    }["AuthProvider.useMemo[value]"], [
        user,
        loading
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/AuthContext.tsx",
        lineNumber: 69,
        columnNumber: 10
    }, this);
}
_s(AuthProvider, "toMAEfa0y2Y/qFyTEOMPzs9vbbY=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/api.ts
// Semua komunikasi ke Flask backend melalui Next.js rewrite proxy (/api/*)
__turbopack_context__.s([
    "getConfig",
    ()=>getConfig,
    "getModels",
    ()=>getModels,
    "getStatus",
    ()=>getStatus,
    "sendChat",
    ()=>sendChat
]);
async function sendChat(messages, systemPrompt) {
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
            error: "no_messages"
        };
    }
    const payload = {
        messages,
        ...systemPrompt ? {
            system_prompt: systemPrompt
        } : {}
    };
    console.log("[API.sendChat] Payload to send:", JSON.stringify(payload, null, 2));
    try {
        console.log("[API.sendChat] Fetching /api/chat POST...");
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        console.log("[API.sendChat] Response status:", res.status);
        const data = await res.json();
        console.log("[API.sendChat] Response data:", data);
        if (!res.ok) {
            return {
                reply: data.reply || data.error || `HTTP ${res.status}`,
                model: "error",
                tokens: {},
                error: data.error || "unknown_error"
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
            error: "network_error"
        };
    }
}
async function getStatus() {
    const res = await fetch("/api/status", {
        cache: "no-store"
    });
    if (!res.ok) return {
        status: "offline",
        models: []
    };
    return res.json();
}
async function getModels() {
    const res = await fetch("/api/models", {
        cache: "no-store"
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.models ?? [];
}
async function getConfig() {
    const res = await fetch("/api/config", {
        cache: "no-store"
    });
    if (!res.ok) return null;
    return res.json();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/ChatContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatProvider",
    ()=>ChatProvider,
    "useChat",
    ()=>useChat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const CHAT_STORAGE_KEY = "bgai_chat_sessions";
const ChatContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function makeSession(name) {
    const now = new Date().toISOString();
    return {
        id: `session_${Date.now()}`,
        title: name || `Sesi Chat ${new Date().toLocaleString()}`,
        createdAt: now,
        updatedAt: now,
        messages: []
    };
}
function ChatProvider({ children }) {
    _s();
    const [sessions, setSessions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeSessionId, setActiveSessionId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatProvider.useEffect": ()=>{
            const saved = localStorage.getItem(CHAT_STORAGE_KEY);
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    setSessions(data);
                    if (data.length > 0) {
                        setActiveSessionId(data[0].id);
                    }
                } catch  {
                    localStorage.removeItem(CHAT_STORAGE_KEY);
                }
            } else {
                // Create initial session if none exist
                const initialSession = makeSession("Sesi Pertama");
                setSessions([
                    initialSession
                ]);
                setActiveSessionId(initialSession.id);
            }
        }
    }["ChatProvider.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatProvider.useEffect": ()=>{
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));
        }
    }["ChatProvider.useEffect"], [
        sessions
    ]);
    const createSession = (name)=>{
        const s = makeSession(name);
        setSessions((prev)=>[
                s,
                ...prev
            ]);
        setActiveSessionId(s.id);
    };
    const deleteSession = (sessionId)=>{
        setSessions((prev)=>prev.filter((session)=>session.id !== sessionId));
        if (activeSessionId === sessionId) {
            const next = sessions.find((s)=>s.id !== sessionId);
            setActiveSessionId(next?.id || "");
        }
    };
    const setActiveSession = (sessionId)=>{
        if (sessions.some((s)=>s.id === sessionId)) {
            setActiveSessionId(sessionId);
        }
    };
    const addMessage = (sessionId, payload)=>{
        setSessions((prev)=>prev.map((session)=>{
                if (session.id !== sessionId) return session;
                const msg = {
                    ...payload,
                    id: `${sessionId}_${Date.now()}`,
                    createdAt: new Date().toISOString()
                };
                return {
                    ...session,
                    updatedAt: new Date().toISOString(),
                    messages: [
                        ...session.messages,
                        msg
                    ]
                };
            }));
    };
    const sendMessage = async (text)=>{
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
        // 1. Tambahkan pesan user ke UI
        addMessage(targetSessionId, {
            sessionId: targetSessionId,
            role: "user",
            text
        });
        // 2. LOGIKA UBAH NAMA SESI: Jika ini pesan pertama, ubah judul sesi
        const currentSession = sessions.find((s)=>s.id === targetSessionId);
        if (currentSession && currentSession.messages.length === 0) {
            setSessions((prev)=>prev.map((s)=>s.id === targetSessionId ? {
                        ...s,
                        title: text.substring(0, 30) + (text.length > 30 ? "..." : "")
                    } : s));
        }
        // Find OR create session
        let targetSession = sessions.find((s)=>s.id === targetSessionId);
        if (!targetSession) {
            console.log("[ChatContext] No active session found, creating new one");
            targetSession = makeSession();
            setSessions([
                targetSession,
                ...sessions
            ]);
            setActiveSessionId(targetSession.id);
            targetSessionId = targetSession.id;
        }
        console.log("[ChatContext] Target session:", {
            id: targetSession.id,
            title: targetSession.title,
            messages_count: targetSession.messages.length
        });
        // Build message list to send to Flask
        // Include all existing messages in this session + new user message
        const messagesToSend = [];
        // Add existing messages from session
        targetSession.messages.forEach((msg)=>{
            messagesToSend.push({
                role: msg.role,
                content: msg.text
            });
        });
        // Add the new user message
        messagesToSend.push({
            role: "user",
            content: text
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
                role: "user",
                content: text
            });
            console.log("[ChatContext] FORCED messagesToSend:", messagesToSend);
        }
        // Add user message to UI immediately (optimistic update)
        addMessage(targetSessionId, {
            sessionId: targetSessionId,
            role: "user",
            text
        });
        // Send to Flask backend
        try {
            console.log("[ChatContext] About to call Flask /api/chat with:", messagesToSend);
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sendChat"])(messagesToSend);
            console.log("[ChatContext] Flask response received:", response);
            if (response.error) {
                console.log("[ChatContext] Error in response, adding error message");
                addMessage(targetSessionId, {
                    sessionId: targetSessionId,
                    role: "assistant",
                    text: `❌ Error (${response.error}): ${response.reply}`
                });
            } else {
                console.log("[ChatContext] Success, adding AI response");
                addMessage(targetSessionId, {
                    sessionId: targetSessionId,
                    role: "assistant",
                    text: response.reply
                });
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error("[ChatContext] Exception:", errorMsg);
            addMessage(targetSessionId, {
                sessionId: targetSessionId,
                role: "assistant",
                text: `❌ Error: ${errorMsg}\n\nPastikan:\n1. Flask backend berjalan (python main.py di folder log)\n2. LM Studio server sudah dimulai\n3. Model Qwen3-4B dimuat di LM Studio`
            });
        }
        console.log("[ChatContext] ===== sendMessage END =====\n");
    };
    const activeSession = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ChatProvider.useMemo[activeSession]": ()=>sessions.find({
                "ChatProvider.useMemo[activeSession]": (s)=>s.id === activeSessionId
            }["ChatProvider.useMemo[activeSession]"]) || null
    }["ChatProvider.useMemo[activeSession]"], [
        sessions,
        activeSessionId
    ]);
    const value = {
        sessions,
        activeSessionId,
        activeSession,
        createSession,
        setActiveSession,
        addMessage,
        sendMessage,
        deleteSession
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/ChatContext.tsx",
        lineNumber: 254,
        columnNumber: 10
    }, this);
}
_s(ChatProvider, "6yn2ImW8XkriFc1RahY0ouzNu1o=");
_c = ChatProvider;
function useChat() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within ChatProvider");
    }
    return context;
}
_s1(useChat, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "ChatProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/ToastContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
// src/context/ToastContext.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
// ── Context ──────────────────────────────────────────────────
const ToastContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    toast: ()=>{}
});
let _id = 0;
function ToastProvider({ children }) {
    _s();
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const toast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ToastProvider.useCallback[toast]": (message, type = "info")=>{
            const id = ++_id;
            setToasts({
                "ToastProvider.useCallback[toast]": (prev)=>[
                        ...prev,
                        {
                            id,
                            message,
                            type
                        }
                    ]
            }["ToastProvider.useCallback[toast]"]);
            setTimeout({
                "ToastProvider.useCallback[toast]": ()=>{
                    setToasts({
                        "ToastProvider.useCallback[toast]": (prev)=>prev.filter({
                                "ToastProvider.useCallback[toast]": (t)=>t.id !== id
                            }["ToastProvider.useCallback[toast]"])
                    }["ToastProvider.useCallback[toast]"]);
                }
            }["ToastProvider.useCallback[toast]"], 3500);
        }
    }["ToastProvider.useCallback[toast]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContext.Provider, {
        value: {
            toast
        },
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastStack, {
                toasts: toasts
            }, void 0, false, {
                fileName: "[project]/src/context/ToastContext.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/context/ToastContext.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
_s(ToastProvider, "OPZKGrTNnwp+klP+pH502F/rcGc=");
_c = ToastProvider;
const useToast = ()=>{
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ToastContext);
};
_s1(useToast, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
// ── UI Stack ─────────────────────────────────────────────────
const TOAST_STYLES = {
    info: {
        background: "#0f2035",
        border: "1px solid #00897f",
        color: "#00d4c8"
    },
    success: {
        background: "#0a1f12",
        border: "1px solid #1a7a4a",
        color: "#3dffa0"
    },
    warn: {
        background: "#1a1500",
        border: "1px solid #f5c842",
        color: "#f5c842"
    },
    error: {
        background: "#1a0008",
        border: "1px solid #ff4d6d",
        color: "#ff4d6d"
    }
};
const TOAST_ICON = {
    info: "i",
    success: "v",
    warn: "!",
    error: "x"
};
function ToastStack({ toasts }) {
    if (toasts.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            pointerEvents: "none"
        },
        children: toasts.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...TOAST_STYLES[t.type],
                    padding: "11px 18px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: "0 4px 20px rgba(0,0,0,.4)",
                    maxWidth: 340,
                    animation: "fadeUp .3s ease"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: 14,
                            flexShrink: 0,
                            fontWeight: 700
                        },
                        children: TOAST_ICON[t.type]
                    }, void 0, false, {
                        fileName: "[project]/src/context/ToastContext.tsx",
                        lineNumber: 84,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: t.message
                    }, void 0, false, {
                        fileName: "[project]/src/context/ToastContext.tsx",
                        lineNumber: 87,
                        columnNumber: 11
                    }, this)
                ]
            }, t.id, true, {
                fileName: "[project]/src/context/ToastContext.tsx",
                lineNumber: 76,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/context/ToastContext.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
_c1 = ToastStack;
var _c, _c1;
__turbopack_context__.k.register(_c, "ToastProvider");
__turbopack_context__.k.register(_c1, "ToastStack");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ChatContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/ChatContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/ToastContext.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
function RootLayout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: "id",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastProvider"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ChatContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChatProvider"], {
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/src/app/layout.tsx",
                        lineNumber: 14,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/layout.tsx",
                    lineNumber: 13,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/layout.tsx",
                lineNumber: 12,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/layout.tsx",
            lineNumber: 11,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/layout.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, this);
}
_c = RootLayout;
var _c;
__turbopack_context__.k.register(_c, "RootLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0.99ugj._.js.map