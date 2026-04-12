'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { validatePassword, validatePasswordMatch } from '@/lib/validators'
import { parseErrorMessage as parseError } from '@/lib/errors'

export default function RegisterForm() {
  const { register, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [name, setname] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!validatePassword(password, 6)) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!validatePasswordMatch(password, confirmPassword)) {
      setError('Passwords do not match')
      return
    }

    try {
      await register(email, password, name)
      setSuccess('Registration successful! Redirecting...')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setname('')
    } catch (err) {
      setError(parseError(err, 'Registration failed'))
    }
  }

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
      padding: '20px',
      maxWidth: '400px',
      margin: '0 auto'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500' as const,
      color: '#333'
    },
    input: {
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px',
      fontFamily: 'inherit',
      boxSizing: 'border-box' as const
    },
    button: {
      padding: '10px 16px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500' as const,
      cursor: 'pointer',
      marginTop: '8px'
    },
    error: {
      padding: '10px 12px',
      backgroundColor: '#fee',
      color: '#c33',
      borderRadius: '6px',
      fontSize: '14px'
    },
    success: {
      padding: '10px 12px',
      backgroundColor: '#efe',
      color: '#3c3',
      borderRadius: '6px',
      fontSize: '14px'
    }
  }

  return (
    <div style={styles.container}>
      <h2>Create Account</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            disabled={loading}
          />
        </div>
         <div style={styles.formGroup}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            value={name}
            onChange={(e) => setname(e.target.value)}
            placeholder="Enter name"
            disabled={loading}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            disabled={loading}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Confirm Password</label>
          <input
            style={styles.input}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            disabled={loading}
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <button
          style={styles.button}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
    </div>
  )
}