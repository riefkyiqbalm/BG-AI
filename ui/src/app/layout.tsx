"use client";

import "@/styles/global.css";
import { AuthProvider } from "../context/AuthContext";
import { ChatProvider } from "../context/ChatContext";
import { ToastProvider } from "@/context/ToastContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <ToastProvider>
              <ChatProvider>{children}</ChatProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
