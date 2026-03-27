"use client";

import React from "react";
import { ChatMessage } from "../types";

interface Props {
  message: ChatMessage;
}

function formatBold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((chunk, index) =>
    index % 2 === 1 ? <strong key={index}>{chunk}</strong> : chunk
  );
}

export default function MessageBubble({ message }: Props) {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`p-3 rounded-lg mb-2 max-w-[80%] ${message.role === "user" ? "self-end bg-cyan-200 text-slate-900" : "self-start bg-slate-800 text-white"}`}>
      <div className="text-xs text-slate-400 mb-1">{message.role === "user" ? "Anda" : "AI"} • {time}</div>
      <div>{formatBold(message.text)}</div>
    </div>
  );
}
