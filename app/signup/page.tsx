'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // If email confirmation is disabled in Supabase, a session is returned immediately.
    // Redirect straight to /sell either way — no waiting for inbox.
    if (data.session) {
      router.push('/sell')
      router.refresh()
    } else {
      // Supabase still has email confirmation on — show the inbox prompt as fallback.
      setSuccess(true)
    }
  }

  const inputStyle = {
    background: '#0d0d0d',
    border: '1px solid #222',
    borderRadius: '2px' as const,
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 300,
    padding: '14px',
    width: '100%',
    display: 'block',
  }

  const labelStyle = {
    fontSize: '10px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: '#888',
    display: 'block',
    marginBottom: '8px',
  }

  if (success) {
    return (
      <div
        style={{
          maxWidth: '420px',
          margin: '0 auto',
          padding: '120px 24px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '36px',
            fontWeight: 300,
            color: '#ffffff',
            marginBottom: '16px',
          }}
        >
          Check your inbox.
        </h1>
        <p style={{ fontSize: '13px', color: '#cccccc', lineHeight: 1.7 }}>
          We sent a confirmation email to <strong style={{ color: '#ffffff' }}>{email}</strong>.
          Click the link to verify your account and start selling.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: '80px 24px' }}>
      <p
        style={{
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#888',
          marginBottom: '12px',
        }}
      >
        Create Account
      </p>
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '40px',
          fontWeight: 300,
          color: '#ffffff',
          marginBottom: '40px',
        }}
      >
        Join Bouquet Broke
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Layla M."
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="layla@gmail.com"
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            required
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ fontSize: '12px', color: '#c0392b', letterSpacing: '0.04em' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#cccccc' : '#f0ebe4',
            color: '#0d0d0d',
            fontSize: '10px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            padding: '16px',
            borderRadius: '2px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '8px',
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p
        style={{
          marginTop: '32px',
          fontSize: '12px',
          color: '#888',
          textAlign: 'center',
        }}
      >
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#cccccc' }}>
          Log in
        </Link>
      </p>
    </div>
  )
}
