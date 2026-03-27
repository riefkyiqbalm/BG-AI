"use client";

import Link from "next/link";
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { sessions, activeSessionId, createSession, setActiveSession, deleteSession } = useChat();

  return (
    <aside className="w-80 p-4 bg-slate-900 text-white h-screen overflow-y-auto border-r border-slate-700">
      <div className="mb-5">
        <div className="font-bold text-lg">BG-AI</div>
        <div className="text-sm text-slate-400">{user?.name || "Guest"}</div>
      </div>

      <button onClick={() => createSession()} className="w-full px-3 py-2 mb-3 bg-teal-500 rounded text-white hover:bg-teal-400">
        + New Chat
      </button>

      <div className="space-y-2">
        {sessions.length === 0 ? (
          <p className="text-slate-300">Belum ada sesi. Klik New Chat.</p>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className={`p-2 rounded ${session.id === activeSessionId ? "bg-teal-700" : "bg-slate-800"}`}>
              <button onClick={() => setActiveSession(session.id)} className="text-left w-full">
                {session.title}
              </button>
              <div className="flex gap-2 justify-end mt-1">
                <button onClick={() => deleteSession(session.id)} className="text-xs text-rose-400 hover:text-rose-200">Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 border-t border-slate-700 pt-3 space-y-2">
        <Link href="/dashboard" className="block text-slate-300 hover:text-white">Dashboard</Link>
        <Link href="/terms" className="block text-slate-300 hover:text-white">Terms</Link>
        <button onClick={logout} className="w-full text-left text-slate-300 hover:text-white">Logout</button>
      </div>
    </aside>
  );
}
