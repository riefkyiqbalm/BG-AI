"use client";

import Link from "next/link";
import React from "react";
import { useChat } from "@/context/ChatContext";
import LogoIcon from "./LogoIcon";

export default function TopPanel() {
  const { activeSession } = useChat();

  return (
    <div style={S.topbar}>
      <div style={S.topbarComponent}>
         <LogoIcon />
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
  );
}

// ── Inline styles ─────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
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
  topbarComponent: {
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
};
