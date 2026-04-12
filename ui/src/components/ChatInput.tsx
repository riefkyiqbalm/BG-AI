'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getAuthToken, parseErrorMessage, handleAPIError } from '@/lib/errors'

export interface ChatInputProps {
  sessionId?: number
  onMessageSent?: (message: string) => void
}

export default function ChatInput({ sessionId, onMessageSent }: ChatInputProps) {
  const { user, isAuthenticated } = useAuth()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const saveMessage = async (text: string) => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to send messages')
      return
    }

    if (!sessionId) {
      setError('No active chat session')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = getAuthToken()
      if (!token) throw new Error('No authentication token')

      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: {
            role: 'user',
            content: text,
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        const error = await handleAPIError(response)
        throw new Error(error.message)
      }

      onMessageSent?.(text)
      setMessage('')
    } catch (err) {
      setError(parseErrorMessage(err, 'Failed to send message'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      setError('Message cannot be empty')
      return
    }

    saveMessage(message.trim())
  }

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      padding: '16px',
      borderTop: '1px solid #eee'
    },
    form: {
      display: 'flex',
      gap: '8px'
    },
    input: {
      flex: 1,
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px',
      fontFamily: 'inherit',
      boxSizing: 'border-box' as const
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500' as const,
      cursor: 'pointer',
      minWidth: '80px'
    },
    error: {
      padding: '8px 12px',
      backgroundColor: '#fee',
      color: '#c33',
      borderRadius: '4px',
      fontSize: '13px'
    },
    disabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ ...styles.container, ...styles.error }}>
        Please log in to send messages
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.disabled : {})
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
      {error && <div style={styles.error}>{error}</div>}
    </div>
  )
}