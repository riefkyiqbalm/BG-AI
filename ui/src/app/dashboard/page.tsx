"use client";

import React from "react";
import { useChat } from "../../context/ChatContext";
import { useLMStatus } from "../../hooks/useLMStatus";

export default function DashboardPage() {
  const { sessions } = useChat();
  const status = useLMStatus();

  const totalMessages = sessions.reduce((count, s) => count + s.messages.length, 0);

  return (
    <div className="h-screen p-6 bg-slate-950 text-white">
      <h1 className="text-3xl font-bold">Dashboard SATU-AI</h1>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
          <h2 className="text-xl font-semibold">Sesi</h2>
          <p>Total sesi: {sessions.length}</p>
          <p>Total pesan: {totalMessages}</p>
          <p>Sesi aktif: {sessions.length ? sessions[0].title : "-"}</p>
        </div>

        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
          <h2 className="text-xl font-semibold">Status Sistem</h2>
          <p>LM: {status.online ? "Online" : "Offline"}</p>
          <p>Model: {status.model}</p>
          <p>Latency: {status.latencyMs} ms</p>
          <p>Requests/min: {status.requestsPerMin}</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
        <h2 className="text-xl font-semibold">Analitik sesi realtime</h2>
        <p>Menampilkan data terbaru secara berkala.</p>
        <p>Update terakhir: {new Date(status.lastChecked).toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
