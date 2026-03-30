"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import HamburgerIcon from "@/components/HamburgerIcon";
import NewChatButton from "@/components/NewButton";
import SessionList from "@/components/ChatList";
import SidebarFooter from "@/components/LeftFooter";

export default function Sidebar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside style={{
      ...S.sidebar, 
      width: isOpen ? 280 : 70,
    }}>
      <div style={S.container}>
        <div style={S.header}>
          <HamburgerIcon isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
          <div style={{
            ...S.titleContainer, 
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateX(0)" : "translateX(-10px)",
            pointerEvents: isOpen ? "auto" : "none"
          }}>
            <div style={S.title}>BG-AI</div>
            <div style={S.subtitle}>{user?.name || "Guest"}</div>
          </div>
        </div>

        <div style={{ 
          opacity: isOpen ? 1 : 0, 
          transition: "opacity 0.2s ease-in-out",
          display: "flex",
          flexDirection: "column",
          flex: 1
        }}>
          <NewChatButton isOpen={isOpen} />
          <SessionList isOpen={isOpen} />
          <SidebarFooter isOpen={isOpen} />
        </div>
      </div>
    </aside>
  );
}

const S: Record<string, React.CSSProperties> = {
  sidebar: {
    background: "rgb(15, 23, 42)",
    color: "white",
    height: "100vh",
    borderRight: "1px solid rgb(55, 65, 81)",
    // Animasi yang lebih smooth menggunakan cubic-bezier
    transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    overflowX: "hidden",
    position: "relative",
  },
  container: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: 280, // Tetapkan width container agar konten tidak "bergoyang" saat diresize
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    minHeight: 40,
  },
  titleContainer: {
    flex: 1,
    transition: "all 0.3s ease-in-out",
    whiteSpace: "nowrap",
  },
  title: { fontWeight: "bold", fontSize: 18 },
  subtitle: { fontSize: 14, color: "rgb(148, 163, 184)" },
};