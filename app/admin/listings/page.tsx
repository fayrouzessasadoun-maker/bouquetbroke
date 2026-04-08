'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Listing } from '@/lib/types'

export default function AdminListingsPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_auth')
    if (saved === 'true') {
      setAuthenticated(true)
    }
  }, [])

  const fetchListings = useCallback(async () => {
    setLoading(true)
    const password = sessionStorage.getItem('admin_password') || ''
    const res = await fetch('/api/admin/listings', {
      headers: { 'x-admin-password': password },
    })
    if (res.ok) {
      const data = await res.json()
      setListings(data.listings || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authenticated) {
      fetchListings()
    }
  }, [authenticated, fetchListings])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput }),
    })

    if (res.ok) {
      sessionStorage.setItem('admin_auth', 'true')
      sessionStorage.setItem('admin_password', passwordInput)
      setAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('Incorrect password.')
    }
  }

  const inputStyle = {
    background: '#0d0d0d',
    border: '1px solid #222',
    borderRadius: '2px' as const,
    color: '#ffffff',
    fontSize: '13px',
    padding: '14px',
    width: '100%',
  }

  if (!authenticated) {
    return (
      <div style={{ maxWidth: '360px', margin: '0 auto', padding: '120px 24px' }}>
        <p
          style={{
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#888',
            marginBottom: '12px',
          }}
        >
          Admin Access
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '36px',
            fontWeight: 300,
            color: '#ffffff',
            marginBottom: '32px',
          }}
        >
          Enter Password
        </h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Admin password"
            style={inputStyle}
          />
          {authError && (
            <p style={{ fontSize: '12px', color: '#c0392b' }}>{authError}</p>
          )}
          <button
            type="submit"
            style={{
              background: '#f0ebe4',
              color: '#0d0d0d',
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '14px',
              borderRadius: '2px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Enter
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '40px',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: '8px',
            }}
          >
            Admin
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '36px',
              fontWeight: 300,
              color: '#ffffff',
            }}
          >
            Pending Listings
          </h1>
        </div>
        <button
          onClick={fetchListings}
          style={{
            background: 'transparent',
            border: '1px solid #333',
            borderRadius: '2px',
            color: '#cccccc',
            fontSize: '10px',
            letterSpacing: '0.12em',
            padding: '10px 16px',
            cursor: 'pointer',
          }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#444' }}>Loading...</p>
      ) : listings.length === 0 ? (
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '20px',
            fontStyle: 'italic',
            color: '#888',
            padding: '60px 0',
          }}
        >
          No listings awaiting review.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid #222' }}>
                {['Photo', 'Brand', 'Size', 'Area', 'Submitted', 'Action'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      fontSize: '10px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#888',
                      padding: '12px 16px',
                      fontWeight: 400,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr
                  key={listing.id}
                  style={{ borderBottom: '1px solid #1a1a1a' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    {listing.photo_url ? (
                      <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                        <Image
                          src={listing.photo_url}
                          alt=""
                          fill
                          style={{ objectFit: 'cover', borderRadius: '2px' }}
                          sizes="60px"
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          background: '#1a1a1a',
                          borderRadius: '2px',
                        }}
                      />
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#ffffff' }}>
                    {listing.brand}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#cccccc' }}>
                    {listing.size}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#cccccc' }}>
                    {listing.area}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#888' }}>
                    {new Date(listing.created_at).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link
                      href={`/admin/price/${listing.id}`}
                      style={{
                        fontSize: '10px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#f0ebe4',
                        background: '#1a1a1a',
                        padding: '8px 14px',
                        borderRadius: '2px',
                        border: '1px solid #333',
                        display: 'inline-block',
                      }}
                    >
                      Review &amp; Price
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
