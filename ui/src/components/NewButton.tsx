"use client";
import { useChat } from "@/context/ChatContext";
import React from "react";

export default function NewChatButton({ isOpen }: { isOpen: boolean }) {
  const { createSession } = useChat();

  if (!isOpen) return null;

  return (
    <button onClick={() => createSession()} style={S.newChatBtn}>
      + New Chat
    </button>
  );
}

const S: Record<string, React.CSSProperties> = {
  newChatBtn: {
    width: "100%",
    padding: "8px 12px",
    marginBottom: 12,
    background: "linear-gradient(135deg, var(--teal-dim), #004f6e)",
    borderRadius: 6,
    color: "white",
    border: "none",
    cursor: "pointer",
    fontFamily: "DM Sans, sans-serif",
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
    transition: "all .2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
};