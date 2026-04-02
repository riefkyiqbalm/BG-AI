'use client';

import React from 'react';
import MessageBubble from './MessageBubble';
import SuggestionsList from './DefaultPrompt';
import TypingIndicator from './TypeIndicator';
import { UIMessage } from '@/types';

interface ChatAreaProps {
  messages: UIMessage[];
  isWelcomeScreen: boolean;
  isCurrentLoading: boolean;
  onSelectSuggestion: (prompt: string) => void;
}

export default function ChatArea({ messages, isWelcomeScreen, isCurrentLoading, onSelectSuggestion }: ChatAreaProps) {
  return (
    <div style={S.chatArea} className="custom-scroll">
      {isWelcomeScreen ? (
        <div style={S.welcome} className="animate-fade-up">
          <div style={S.welcomeIcon}>🌿</div>
          <h2 style={S.h2}>Halo, <span style={{ color: 'var(--teal)' }}>Riefky P.</span></h2>
          <p style={S.p}>Asisten BGAI siap membantu untuk proses administrasi dan perizinan IPAL.</p>
          <SuggestionsList onSelect={onSelectSuggestion} />
        </div>
      ) : (
        <div style={S.messageList}>
          {messages.map((m) => (
            <MessageBubble key={m.id} msg={m} />
          ))}
        </div>
      )}

      {isCurrentLoading && <TypingIndicator />}

      <div style={{ height: 1 }} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 5% 40px',
    display: 'flex',
    flexDirection: 'column',
  },
  welcome: {
    margin: 'auto',
    textAlign: 'center',
    maxWidth: 600,
    padding: '40px 0',
  },
  welcomeIcon: {
    fontSize: 40,
    background: 'rgba(0, 212, 200, 0.1)',
    width: 80,
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    margin: '0 auto 20px',
    border: '1px solid var(--teal)',
  },
  h2: { fontSize: 32, fontWeight: 800, marginBottom: 12 },
  p: { color: 'var(--muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 30 },
  messageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    maxWidth: 800,
    margin: '0 auto',
    width: '100%',
  },
};
