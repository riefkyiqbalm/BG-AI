"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import RightPanel from "../../components/RightPanel";
import MessageBubble from "../../components/MessageBubble";
import { useChat } from "../../context/ChatContext";

export default function ChatPage() {
  const { activeSession, sendMessage } = useChat();
  const [input, setInput] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 p-4 bg-slate-950 text-white flex flex-col">
        <div className="mb-3">
          <h1 className="text-2xl font-bold">Chat Multi-Sesi</h1>
          <p className="text-slate-400">Sesi: {activeSession?.title ?? "Tidak ada sesi aktif"}</p>
        </div>

        <section className="flex-1 overflow-y-auto p-4 bg-slate-900 rounded-lg mb-4 flex flex-col gap-2">
          {activeSession?.messages.length ? (
            activeSession.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          ) : (
            <p className="text-slate-400">Belum ada pesan. Kirim pesan untuk mulai diskusi.</p>
          )}
        </section>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 rounded-lg p-2 bg-slate-800 border border-slate-700"
          />
          <button type="submit" className="bg-teal-500 px-4 rounded-lg hover:bg-teal-400">
            Kirim
          </button>
        </form>
      </main>

      <RightPanel />
    </div>
  );
}
