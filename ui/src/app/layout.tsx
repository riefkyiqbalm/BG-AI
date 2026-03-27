"use client";

import "../styles/global.css";
import { AuthProvider } from "../context/AuthContext";
import { ChatProvider } from "../context/ChatContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <ChatProvider>{children}</ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
