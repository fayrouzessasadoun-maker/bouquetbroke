'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError('Invalid email or password.')
      return
    }

    router.push(redirect)
    router.refresh()
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
        Welcome Back
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
        Sign In
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            placeholder="Your password"
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
          {loading ? 'Signing In...' : 'Sign In'}
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
        New here?{' '}
        <Link href="/signup" style={{ color: '#cccccc' }}>
          Create an account
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#444' }}>Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
