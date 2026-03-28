"use client";
// src/components/MessageBubble.tsx

import { UIMessage } from "@/types";

interface Props {
  msg: UIMessage;
}

// Format teks: **bold**, \n → <br>
function formatText(text: string): React.ReactNode[] {
  return text.split("\n").map((line, li, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={li}>
        {parts.map((p, pi) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={pi}>{p.slice(2, -2)}</strong>
          ) : (
            <span key={pi}>{p}</span>
          )
        )}
        {li < arr.length - 1 && <br />}
      </span>
    );
  });
}

function timeStr(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({ msg }: Props) {
  const isUser = msg.role === "user";

  return (
    <div style={{ ...S.row, ...(isUser ? S.rowUser : {}) }}>
      {/* Avatar */}
      <div style={{ ...S.avatar, ...(isUser ? S.avatarUser : S.avatarBot) }}>
        {isUser ? "👤" : "🌿"}
      </div>

      {/* Bubble + meta */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: "86%" }}>
        <div
          style={{
            ...S.bubble,
            ...(isUser ? S.bubbleUser : S.bubbleBot),
          }}
        >
          {/* isStreaming: tampilkan kursor berkedip di akhir */}
          {formatText(msg.text)}
          {msg.isStreaming && (
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 14,
                background: "var(--teal)",
                marginLeft: 4,
                verticalAlign: "middle",
                animation: "blink 1s infinite",
              }}
            />
          )}
        </div>

        {/* Timestamp */}
        <div
          style={{
            ...S.meta,
            ...(isUser ? { textAlign: "right" as const } : {}),
          }}
        >
          {timeStr(msg.createdAt)}
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    gap: 12,
    alignSelf: "flex-start",
    maxWidth: 820,
    animation: "fadeUp .3s ease",
  },
  rowUser: { flexDirection: "row-reverse", alignSelf: "flex-end" },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    marginTop: 2,
  },
  avatarBot: {
    background: "linear-gradient(135deg,var(--teal-dim),#004f6e)",
    boxShadow: "var(--glow)",
  },
  avatarUser: {
    background: "var(--card)",
    border: "1px solid var(--border)",
  },
  bubble: {
    padding: "12px 16px",
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.7,
  },
  bubbleBot: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    background: "linear-gradient(135deg,rgba(0,212,200,.18),rgba(0,80,160,.18))",
    border: "1px solid rgba(0,212,200,.3)",
    borderTopRightRadius: 4,
  },
  meta: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--muted)",
    paddingLeft: 4,
  },
};