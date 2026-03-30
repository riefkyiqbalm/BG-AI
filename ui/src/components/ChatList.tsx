"use client";
import { useChat } from "@/context/ChatContext";
import React from "react";
import ActionMenu from "@/components/Action" ; // Sesuaikan path

export default function SessionList({ isOpen }: { isOpen: boolean }) {
  const { sessions, activeSessionId, setActiveSession, deleteSession } = useChat();

  if (!isOpen) return null;

  const handleAction = (id: string, type: string) => {
    if (type === "delete") deleteSession(id);
    if (type === "rename") {
        const newTitle = prompt("Masukkan nama baru:");
        if (newTitle) {
            // Panggil fungsi rename dari context Anda jika ada
            console.log("Rename session", id, "to", newTitle);
        }
    }
    // Tambahkan logic untuk 'pin' jika sudah ada di backend
  };

  return (
    <div style={S.sessionsList}>
      {sessions.length === 0 ? (
        <p style={S.emptyText}>BELUM ADA SESI.</p>
      ) : (
        sessions.map((session) => (
          <div 
            key={session.id} 
            style={{...S.sessionItem, ...(session.id === activeSessionId ? S.sessionItemActive : S.sessionItemInactive)}}
          >
            <button onClick={() => setActiveSession(session.id)} style={S.sessionButton}>
              {session.title}
            </button>
            
            {/* Menggunakan ActionMenu baru */}
            <ActionMenu 
              actions={["pin", "rename", "delete"]} 
              onAction={(type) => handleAction(session.id, type)}
            />
          </div>
        ))
      )}
    </div>
  );
}
// ... Gaya S (tetap sama seperti kode Anda)

const S: Record<string, React.CSSProperties> = {
  sessionsList: { display: "flex", flexDirection: "column", gap: 8 },
  emptyText: { color: "#5a7a99", fontSize: 15, fontFamily: "Space Mono, monospace", letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 8px 4px" },   
  sessionItem: { 
    padding: "9px 12px", 
    borderRadius: 10, 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    color:"#5a7a99",
    cursor:"pointer",
    transition: "all .15s",
    whiteSpace:"nowrap",
    alignContent: "center",
    textOverflow:"ellipsis",
    gap: 8,
  },
  sessionItemActive: { background: "var(--card)", color: "var(--teal)", borderLeft: "2px solid var(--teal)" },
  sessionButton: { 
    textAlign: "left", 
    flex: 1, 
    background: "none", 
    border: "none", 
    color: "white", 
    cursor: "pointer", 
    fontSize: 14,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  deleteBtn: { fontSize: 11, color: "rgb(251, 113, 133)", border: "none", background: "none", cursor: "pointer" },
  deleteBtnHover: { color: "white" },
};

