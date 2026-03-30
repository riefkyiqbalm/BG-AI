"use client";

import React from "react";
import { useChat } from "../context/ChatContext";
import { useLMStatus } from "../hooks/useLMStatus";

export default function RightPanel() {
  const { sessions, activeSession } = useChat();
  const status = useLMStatus();

  const messageCount = activeSession?.messages.length ?? 0;

  return (
    <aside className="w-72 p-4 bg-slate-950 text-white h-screen border-l border-slate-700 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3">Status LM Studio</h2>
      <p>Status: {status.online ? "Online" : "Offline"}</p>
      <p>Model: {status.model}</p>
      <p>Latency: {status.latencyMs} ms</p>
      <p>RPM: {status.requestsPerMin}</p>
      <p className="text-xs text-slate-400">Last checked: {new Date(status.lastChecked).toLocaleTimeString()}</p>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Sesi & Statistik</h2>
        <p>Total sesi: {sessions.length}</p>
        <p>Aktif: {activeSession?.title ?? "Tidak ada"}</p>
        <p>Jumlah pesan sesi ini: {messageCount}</p>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Kuota (simulasi)</h2>
        <div className="bg-slate-800 h-3 rounded mb-2">
          <div className="bg-teal-500 h-3 rounded" style={{ width: "45%" }} />
        </div>
        <p>45% dari 1000 kuota dipakai.</p>
      </div>
    </aside>
  );
}
