"use client";

import React from "react";
import { useChat } from "../context/ChatContext";
import { useLMStatus } from "../hooks/useLMStatus";
import StatusDot from "./StatusDot";

export default function RightPanel() {
  const { sessions, activeSession } = useChat();
  const status = useLMStatus();

  const messageCount = activeSession?.messages.length ?? 0;

  return (
    <aside style={S.panel}>
      <h2 style={S.sectionTitle}>Status LM Studio</h2>
      <div style={S.statusCard}>
        <div style={S.statusRow}>
          <StatusDot />
        </div>
        <div style={S.infoRow}>
          <span style={S.infoLabel}>Model</span>
          <span style={S.infoValue}>{status.model}</span>
        </div>
        <div style={S.infoRow}>
          <span style={S.infoLabel}>Latency</span>
          <span style={S.infoValue}>{status.latencyMs} ms</span>
        </div>
        <div style={S.infoRow}>
          <span style={S.infoLabel}>RPM</span>
          <span style={S.infoValue}>{status.requestsPerMin}</span>
        </div>
        <div style={S.lastChecked}>
          Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
        </div>
      </div>

      <h2 style={S.sectionTitle}>Sesi & Statistik</h2>
      <div style={S.statusCard}>
        <div style={S.infoRow}>
          <span style={S.infoLabel}>Total sesi</span>
          <span style={S.infoValue}>{sessions.length}</span>
        </div>
        <div style={S.infoRow}>
          <span style={S.infoLabel}>Aktif</span>
          <span style={S.infoValue}>{activeSession?.title ?? "Tidak ada"}</span>
        </div>
        <div style={S.infoRow}>
          <span style={S.infoLabel}>Pesan</span>
          <span style={S.infoValue}>{messageCount}</span>
        </div>
      </div>

      <h2 style={S.sectionTitle}>Kuota (simulasi)</h2>
      <div style={S.statusCard}>
        <div style={S.progressBar}>
          <div style={{ ...S.progressFill, width: "45%" }} />
        </div>
        <p style={S.quotaText}>45% dari 1000 kuota dipakai.</p>
      </div>
    </aside>
  );
}

const S: Record<string, React.CSSProperties> = {
  panel: {
    width: "280px",
    minWidth: "280px",
    padding: "16px",
    background: "var(--panel)",
    borderLeft: "1px solid var(--border)",
    height: "100vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    color: "var(--muted)",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    marginTop: "8px",
  },
  statusCard: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
  },
  infoLabel: {
    color: "var(--muted)",
  },
  infoValue: {
    color: "var(--text)",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
  },
  lastChecked: {
    fontSize: "10px",
    color: "var(--muted)",
    fontFamily: "var(--font-mono)",
    marginTop: "4px",
  },
  progressBar: {
    height: "8px",
    background: "var(--panel)",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, var(--teal), var(--teal-dim))",
    borderRadius: "4px",
  },
  quotaText: {
    fontSize: "12px",
    color: "var(--muted)",
  },
};
