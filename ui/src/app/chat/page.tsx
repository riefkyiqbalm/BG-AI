"use client";
// src/app/chat/page.tsx

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useChat }      from "@/context/ChatContext";
import { useToast }     from "@/context/ToastContext";
import Sidebar          from "@/components/Sidebar";
import MessageBubble    from "@/components/MessageBubble";
import { InputMode, UIMessage } from "@/types";

// ── Kartu saran di welcome screen ────────────────────────────
const SUGGESTIONS = [
  {
    icon: "📸",
    title: "Foto Makanan",
    desc: "Estimasi gizi dari deskripsi piring",
    prompt:
      "Analisis kandungan gizi menu: nasi putih 200g, ayam goreng 100g, tumis kangkung 80g",
  },
  {
    icon: "📝",
    title: "Deskripsi Menu",
    desc: "Ketik bahan dan porsi untuk analisis",
    prompt:
      "Hitung estimasi gizi: nasi 200g, tempe goreng 75g, sup sayuran 150g, pisang 1 buah",
  },
  {
    icon: "📊",
    title: "Cek Standar AKG",
    desc: "Bandingkan menu dengan standar Kemenkes",
    prompt:
      "Apakah menu nasi, ayam, sayur, buah memenuhi standar AKG Kemenkes untuk anak SD usia 7-9 tahun?",
  },
  {
    icon: "🏢",
    title: "Verifikasi Vendor",
    desc: "Cek kelengkapan dokumen vendor MBG",
    prompt:
      "Verifikasi kelengkapan dokumen perizinan vendor MBG dan deteksi potensi anomali anggaran",
  },
];

// ── Halaman chat ──────────────────────────────────────────────
export default function ChatPage() {
  // Ambil dari ChatContext sesuai ChatContextType yang sudah ada
  const {
    activeSession,
    sendMessage,
    createSession,
  } = useChat();

  const { toast } = useToast();

  const [input, setInput]         = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [loading, setLoading]     = useState(false);

  const chatEndRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages]);

  // Auto-resize textarea
  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  // Kirim pesan
  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Buat sesi baru jika belum ada
    if (!activeSession) createSession();

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      await sendMessage(text);
    } catch {
      toast("Gagal terhubung ke AI. Pastikan Flask dan LM Studio aktif.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Enter = kirim, Shift+Enter = baris baru
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Isi prompt dari kartu saran
  const fillPrompt = (text: string) => {
    if (!activeSession) createSession();
    setInput(text);
    setTimeout(() => {
      textareaRef.current?.focus();
      resize();
    }, 50);
  };

  // Attach file
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setInput(
      `[File: ${f.name} (${(f.size / 1024).toFixed(1)} KB)] Tolong analisis file ini.`
    );
    setInputMode("text");
    toast(`File "${f.name}" siap dikirim`, "info");
  };

  // Pesan dari sesi aktif — UIMessage sudah punya field yang benar
  const messages: UIMessage[] = (activeSession?.messages ?? []) as UIMessage[];
  const showWelcome = messages.length === 0;

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={S.root}>
      {/* Sidebar kiri */}
      <Sidebar />

      {/* Area utama */}
      <main style={S.main}>
        {/* Topbar */}
        <div style={S.topbar}>
          <div style={S.topbarTitle}>
            NutriGuard{" "}
            <span style={{ color: "var(--teal)" }}>Analyzer</span>
          </div>

          {activeSession && (
            <span style={S.sessionTitle}>
              {activeSession.title.length > 36
                ? activeSession.title.slice(0, 36) + "…"
                : activeSession.title}
            </span>
          )}

          <span style={S.liveBadge}>● LIVE</span>

          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/dashboard" style={S.tbBtn} title="Dashboard">
              📊
            </Link>
            <Link href="/auth" style={S.tbBtn} title="Pengaturan">
              ⚙
            </Link>
          </div>
        </div>

        {/* Area percakapan */}
        <div style={S.chatArea}>
          {showWelcome ? (
            // Welcome screen
            <div style={S.welcome} className="animate-fade-up">
              <div style={S.welcomeIcon}>🥗</div>
              <h2 style={S.h2}>
                Selamat datang di{" "}
                <span style={{ color: "var(--teal)" }}>NutriGuard</span>
              </h2>
              <p style={S.p}>
                Kirimkan deskripsi menu, foto, atau video makanan untuk analisis
                gizi otomatis. Atau kirim dokumen vendor MBG untuk verifikasi
                perizinan.
              </p>
              <div style={S.suggGrid}>
                {SUGGESTIONS.map((s) => (
                  <div
                    key={s.title}
                    style={S.suggCard}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "var(--teal)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "var(--border)")
                    }
                    onClick={() => fillPrompt(s.prompt)}
                  >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                      {s.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        lineHeight: 1.4,
                      }}
                    >
                      {s.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Daftar pesan — m adalah UIMessage, sudah punya .id dan .text
            messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))
          )}

          {/* Indikator mengetik */}
          {loading && (
            <div style={S.typingRow} className="animate-fade-in">
              <div style={S.typingAvatar}>🌿</div>
              <div style={S.typingBubble}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--teal)",
                      display: "inline-block",
                      animation: `blink 1.2s infinite ${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div style={S.inputArea}>
          {/* Pilihan mode input */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {(["text", "foto", "video", "dokumen"] as InputMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setInputMode(m)}
                style={{
                  ...S.modeBtn,
                  ...(inputMode === m ? S.modeBtnOn : {}),
                }}
              >
                {
                  {
                    text: "✏ Teks",
                    foto: "📸 Foto",
                    video: "🎬 Video",
                    dokumen: "📄 Dokumen",
                  }[m]
                }
              </button>
            ))}
          </div>

          {/* Drop zone untuk mode non-teks */}
          {inputMode !== "text" && (
            <div
              style={S.dropZone}
              onClick={() => document.getElementById("fi-input")?.click()}
            >
              <div style={{ fontSize: 26, marginBottom: 6 }}>☁</div>
              <div style={{ fontSize: 13 }}>Klik untuk memilih file</div>
              <div
                style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}
              >
                Foto: JPG/PNG · Video: MP4 · Dokumen: PDF/DOCX
              </div>
              <input
                id="fi-input"
                type="file"
                style={{ display: "none" }}
                onChange={handleFile}
              />
            </div>
          )}

          {/* Kotak input teks */}
          <div style={S.inputBox}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                resize();
              }}
              onKeyDown={handleKey}
              placeholder="Deskripsikan makanan atau tanyakan tentang gizi…"
              rows={1}
              style={S.textarea}
              disabled={loading}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                style={S.inpBtn}
                title="Lampirkan file"
                onClick={() => document.getElementById("fi-input")?.click()}
              >
                📎
              </button>
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  ...S.sendBtn,
                  ...(loading || !input.trim()
                    ? { opacity: 0.45, cursor: "not-allowed" as const }
                    : {}),
                }}
                title="Kirim (Enter)"
              >
                ➤
              </button>
            </div>
          </div>

          {/* Hint */}
          <div style={S.hint}>
            Enter untuk kirim · Shift+Enter baris baru ·{" "}
            <Link href="/terms" style={{ color: "var(--teal)" }}>
              Ketentuan Layanan
            </Link>{" "}
            · Model: Qwen3-4B via LM Studio
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Inline styles ─────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    background: "var(--bg)",
    color: "var(--text)",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
  topbar: {
    height: 56,
    minHeight: 56,
    background: "var(--panel)",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    gap: 12,
  },
  topbarTitle: {
    fontFamily: "var(--font-head)",
    fontSize: 16,
    fontWeight: 800,
    flex: 1,
  },
  sessionTitle: {
    fontSize: 12,
    color: "var(--muted)",
    fontFamily: "var(--font-mono)",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 280,
  },
  liveBadge: {
    background: "rgba(0,212,200,.1)",
    border: "1px solid rgba(0,212,200,.3)",
    color: "var(--teal)",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    padding: "3px 10px",
    borderRadius: 99,
    letterSpacing: 1,
    flexShrink: 0,
  },
  tbBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "none",
    color: "var(--muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    cursor: "pointer",
    textDecoration: "none",
    flexShrink: 0,
  },
  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: "32px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  welcome: {
    margin: "auto",
    textAlign: "center",
    maxWidth: 560,
  },
  welcomeIcon: {
    width: 72,
    height: 72,
    background:
      "linear-gradient(135deg,rgba(0,212,200,.2),rgba(0,112,255,.15))",
    border: "1px solid rgba(0,212,200,.3)",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    margin: "0 auto 20px",
    boxShadow: "var(--glow)",
  },
  h2: {
    fontFamily: "var(--font-head)",
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 12,
  },
  p: {
    color: "var(--muted)",
    fontSize: 14,
    lineHeight: 1.7,
    marginBottom: 32,
    maxWidth: 480,
    margin: "0 auto 32px",
  },
  suggGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    textAlign: "left",
  },
  suggCard: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    padding: 16,
    cursor: "pointer",
    transition: "border-color .2s",
  },
  typingRow: {
    display: "flex",
    gap: 12,
    alignSelf: "flex-start",
  },
  typingAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "linear-gradient(135deg,var(--teal-dim),#004f6e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    flexShrink: 0,
    boxShadow: "var(--glow)",
  },
  typingBubble: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    borderTopLeftRadius: 4,
    padding: "14px 16px",
    display: "flex",
    gap: 5,
    alignItems: "center",
  },
  inputArea: {
    padding: "14px 32px 20px",
    borderTop: "1px solid var(--border)",
    background: "var(--panel)",
  },
  modeBtn: {
    padding: "5px 14px",
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 600,
    border: "1px solid var(--border)",
    background: "none",
    color: "var(--muted)",
    cursor: "pointer",
    transition: "all .15s",
  },
  modeBtnOn: {
    background: "rgba(0,212,200,.12)",
    borderColor: "var(--teal)",
    color: "var(--teal)",
  },
  dropZone: {
    border: "2px dashed var(--border)",
    borderRadius: 12,
    padding: "18px 20px",
    textAlign: "center",
    color: "var(--muted)",
    cursor: "pointer",
    marginBottom: 10,
    transition: "all .2s",
  },
  inputBox: {
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "10px 12px 10px 18px",
  },
  textarea: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    fontSize: 14,
    lineHeight: 1.6,
    resize: "none",
    maxHeight: 140,
    minHeight: 24,
  },
  inpBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "none",
    color: "var(--muted)",
    fontSize: 16,
    cursor: "pointer",
    flexShrink: 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,var(--teal),#0080cc)",
    color: "#fff",
    fontSize: 16,
    cursor: "pointer",
    transition: "all .2s",
    boxShadow: "0 4px 16px rgba(0,212,200,.3)",
    flexShrink: 0,
  },
  hint: {
    fontSize: 11,
    color: "var(--muted)",
    marginTop: 9,
    textAlign: "center",
  },
};