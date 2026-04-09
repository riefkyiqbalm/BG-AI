"use client";
import React, { useState, useRef, useEffect } from "react";

type ActionType = "copy" | "delete" | "pin" | "rename";

interface ActionMenuProps {
  onAction: (type: ActionType) => void;
  actions: ActionType[];
  align?: "left" | "right";
}

// Koleksi Icon SVG yang Elegan & Konsisten
const Icons = {
  copy: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  ),
  delete: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  pin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path>
      <line x1="12" y1="22" x2="12" y2="12"></line>
    </svg>
  ),
  rename: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  kebab: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="2"></circle>
      <circle cx="12" cy="12" r="2"></circle>
      <circle cx="12" cy="19" r="2"></circle>
    </svg>
  )
};

export default function ActionMenu({ onAction, actions, align = "right" }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} style={{ position: "relative", display: "inline-flex" }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ ...S.kebabBtn, background: isOpen ? "rgba(255,255,255,0.1)" : "none" }}
      >
        {Icons.kebab}
      </button>

      {isOpen && (
        <div style={{ ...S.dropdown, [align === "right" ? "right" : "left"]: 0 }}>
          {actions.map((type) => (
            <button
              key={type}
              onClick={() => { onAction(type); setIsOpen(false); }}
              style={{
                ...S.menuItem,
                color: type === "delete" ? "#ff4d4d" : "#e2e8f0",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <span style={S.iconWrapper}>{Icons[type]}</span>
              <span style={{ fontSize: "13px", fontWeight: 500 }}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  kebabBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    zIndex: 1000,
  },
  dropdown: {
    position: "absolute",
    top: "110%",
    background: "#1a2236",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
    zIndex: 1000,
    minWidth: "140px",
    padding: "4px",
    backdropFilter: "blur(8px)",
  },
  menuItem: {
    width: "100%",
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    borderRadius: "6px",
    transition: "background 0.2s",
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    opacity: 0.8,
  }
};