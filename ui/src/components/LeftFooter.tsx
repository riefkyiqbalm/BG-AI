"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import React from "react";

export default function SidebarFooter({ isOpen }: { isOpen: boolean }) {
  const { logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div style={S.footer}>
      <Link href="/terms" style={S.link}>
        Terms
      </Link>
      <Link href="/dashboard" style={S.link}>
        <div style={{ marginLeft: 12 }}>
          <div style={{ fontWeight: 600 }}>Riefky P.</div>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>
            Admin · LLMGuardians
          </div>
        </div>
        <span
          style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 12 }}
        >
          ⚙
        </span>
      </Link>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  footer: {
    marginTop: "auto",
    borderTop: "1px solid rgb(55, 65, 81)",
    paddingTop: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flexShrink: 0
  },
  link: {
    color: "rgb(203, 213, 225)",
    textDecoration: "none",
    fontSize: 14,
    background: "none",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
  },
};
