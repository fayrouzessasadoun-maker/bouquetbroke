'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PRICING_TABLE, SIZES } from '@/lib/pricing'
import type { Listing, AiPriceResult } from '@/lib/types'

export default function AdminPricePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [authenticated, setAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')

  const [listing, setListing] = useState<Listing | null>(null)
  const [loadingListing, setLoadingListing] = useState(false)

  const [aiResult, setAiResult] = useState<AiPriceResult | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const [finalPrice, setFinalPrice] = useState('')
  const [approving, setApproving] = useState(false)
  const [approveError, setApproveError] = useState('')
  const [approved, setApproved] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_auth')
    if (saved === 'true') setAuthenticated(true)
  }, [])

  const fetchListing = useCallback(async () => {
    setLoadingListing(true)
    const password = sessionStorage.getItem('admin_password') || ''
    const res = await fetch(`/api/admin/listings/${id}`, {
      headers: { 'x-admin-password': password },
    })
    if (res.ok) {
      const data = await res.json()
      setListing(data.listing)
      if (data.listing?.ai_price) {
        setFinalPrice(String(data.listing.ai_price))
      }
    }
    setLoadingListing(false)
  }, [id])

  useEffect(() => {
    if (authenticated) fetchListing()
  }, [authenticated, fetchListing])

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
    } else {
      setAuthError('Incorrect password.')
    }
  }

  const handleAnalyse = async () => {
    setAiLoading(true)
    setAiError('')
    setAiResult(null)

    const res = await fetch('/api/ai-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: id }),
    })

    const data = await res.json()

    if (!res.ok) {
      setAiError(data.error || 'AI analysis failed.')
    } else {
      setAiResult(data)
      setFinalPrice(String(data.suggestedPrice))
    }

    setAiLoading(false)
  }

  const handleApprove = async () => {
    if (!finalPrice || isNaN(Number(finalPrice))) {
      setApproveError('Enter a valid price.')
      return
    }
    setApproving(true)
    setApproveError('')

    const password = sessionStorage.getItem('admin_password') || ''
    const res = await fetch(`/api/admin/listings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({
        ai_price: Number(finalPrice),
        ai_reasoning: aiResult?.reasoning || null,
        ai_brand: aiResult?.detectedBrand || null,
        ai_size: aiResult?.detectedSize || null,
        ai_flowers: aiResult?.flowers || null,
        ai_packaging: aiResult?.packaging || null,
        is_approved: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    })

    if (res.ok) {
      setApproved(true)
    } else {
      const data = await res.json()
      setApproveError(data.error || 'Approval failed.')
    }
    setApproving(false)
  }

  const labelStyle = {
    fontSize: '10px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: '#888',
    display: 'block',
    marginBottom: '6px',
  }

  const valueStyle = {
    fontSize: '13px',
    color: '#ffffff',
    lineHeight: 1.5,
  }

  if (!authenticated) {
    return (
      <div style={{ maxWidth: '360px', margin: '0 auto', padding: '120px 24px' }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '36px',
            fontWeight: 300,
            color: '#ffffff',
            marginBottom: '32px',
          }}
        >
          Admin Access
        </h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Admin password"
            style={{
              background: '#0d0d0d',
              border: '1px solid #222',
              borderRadius: '2px',
              color: '#ffffff',
              fontSize: '13px',
              padding: '14px',
              width: '100%',
            }}
          />
          {authError && <p style={{ fontSize: '12px', color: '#c0392b' }}>{authError}</p>}
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

  if (approved) {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '40px',
            fontWeight: 300,
            color: '#ffffff',
            marginBottom: '16px',
          }}
        >
          Published.
        </h1>
        <p style={{ fontSize: '13px', color: '#cccccc', marginBottom: '32px' }}>
          The listing is now live at AED {finalPrice} and expires in 24 hours.
        </p>
        <Link
          href="/admin/listings"
          style={{
            background: '#f0ebe4',
            color: '#0d0d0d',
            fontSize: '10px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            padding: '14px 28px',
            borderRadius: '2px',
            display: 'inline-block',
          }}
        >
          Back to Listings
        </Link>
      </div>
    )
  }

  if (loadingListing) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#444' }}>Loading listing...</p>
      </div>
    )
  }

  if (!listing) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: '#888' }}>Listing not found.</p>
      </div>
    )
  }

  const brandPricing = PRICING_TABLE[listing.brand || ''] || null

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px' }}>
      <Link
        href="/admin/listings"
        style={{
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#888',
          display: 'inline-block',
          marginBottom: '40px',
        }}
      >
        ← All Listings
      </Link>

      <p
        style={{
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#888',
          marginBottom: '8px',
        }}
      >
        Admin — Price & Approve
      </p>
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '36px',
          fontWeight: 300,
          color: '#ffffff',
          marginBottom: '48px',
        }}
      >
        Review Listing
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'start',
        }}
      >
        {/* Left: Photo + seller info */}
        <div>
          {/* Photo */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '3/4',
              background: '#111',
              border: '1px solid #222',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '24px',
            }}
          >
            {listing.photo_url ? (
              <Image
                src={listing.photo_url}
                alt=""
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#333',
                  fontSize: '10px',
                }}
              >
                NO PHOTO
              </div>
            )}
          </div>

          {/* Seller details */}
          <div
            style={{
              background: '#111',
              border: '1px solid #222',
              borderRadius: '2px',
              padding: '20px',
            }}
          >
            <p style={{ ...labelStyle, marginBottom: '16px' }}>Seller Details</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Brand', value: listing.brand },
                { label: 'Size', value: listing.size },
                { label: 'Area', value: listing.area },
                { label: 'Description', value: listing.description },
                { label: 'WhatsApp', value: listing.whatsapp },
                {
                  label: 'Submitted',
                  value: new Date(listing.created_at).toLocaleString('en-GB'),
                },
              ].map(({ label, value }) => value ? (
                <div key={label}>
                  <span style={labelStyle}>{label}</span>
                  <p style={valueStyle}>{value}</p>
                </div>
              ) : null)}
            </div>
          </div>
        </div>

        {/* Right: Pricing table + AI + approve */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Pricing table for brand */}
          {brandPricing && (
            <div
              style={{
                background: '#111',
                border: '1px solid #222',
                borderRadius: '2px',
                padding: '20px',
              }}
            >
              <p style={{ ...labelStyle, marginBottom: '16px' }}>
                {listing.brand} — Pricing Reference
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {SIZES.map((s) => (
                  <div
                    key={s}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: s === listing.size ? '#1a1a1a' : 'transparent',
                      border: s === listing.size ? '1px solid #333' : '1px solid transparent',
                      borderRadius: '2px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: s === listing.size ? '#ffffff' : '#888',
                      }}
                    >
                      {s}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: '18px',
                        fontWeight: 300,
                        color: s === listing.size ? '#ffffff' : '#888',
                      }}
                    >
                      AED {brandPricing[s]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI analysis */}
          <div
            style={{
              background: '#111',
              border: '1px solid #222',
              borderRadius: '2px',
              padding: '20px',
            }}
          >
            <p style={{ ...labelStyle, marginBottom: '16px' }}>AI Price Analysis</p>

            <button
              onClick={handleAnalyse}
              disabled={aiLoading}
              style={{
                width: '100%',
                background: aiLoading ? '#222' : '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '2px',
                color: aiLoading ? '#888' : '#ffffff',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                padding: '14px',
                cursor: aiLoading ? 'not-allowed' : 'pointer',
                marginBottom: '16px',
              }}
            >
              {aiLoading ? 'Analysing...' : 'Analyse with AI'}
            </button>

            {aiError && (
              <p style={{ fontSize: '12px', color: '#c0392b', marginBottom: '12px' }}>
                {aiError}
              </p>
            )}

            {aiResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#0d0d0d',
                    borderRadius: '2px',
                    border: '1px solid #222',
                  }}
                >
                  <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888' }}>
                    Suggested Price
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '28px',
                      fontWeight: 300,
                      color: '#ffffff',
                    }}
                  >
                    AED {aiResult.suggestedPrice}
                  </span>
                </div>

                {[
                  { label: 'Detected Brand', value: aiResult.detectedBrand },
                  { label: 'Detected Size', value: aiResult.detectedSize },
                  { label: 'Flowers', value: aiResult.flowers },
                  { label: 'Packaging', value: aiResult.packaging },
                  { label: 'Condition', value: aiResult.condition },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <span style={labelStyle}>{label}</span>
                    <p style={{ fontSize: '13px', color: '#cccccc' }}>{value}</p>
                  </div>
                ))}

                <div>
                  <span style={labelStyle}>Reasoning</span>
                  <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6 }}>
                    {aiResult.reasoning}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Final price + approve */}
          <div
            style={{
              background: '#111',
              border: '1px solid #222',
              borderRadius: '2px',
              padding: '20px',
            }}
          >
            <p style={{ ...labelStyle, marginBottom: '16px' }}>Final Price</p>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
              <span
                style={{
                  fontSize: '13px',
                  color: '#888',
                  whiteSpace: 'nowrap',
                }}
              >
                AED
              </span>
              <input
                type="number"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                placeholder="0"
                style={{
                  background: '#0d0d0d',
                  border: '1px solid #333',
                  borderRadius: '2px',
                  color: '#ffffff',
                  fontSize: '22px',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 300,
                  padding: '12px 14px',
                  width: '100%',
                }}
              />
            </div>

            {approveError && (
              <p style={{ fontSize: '12px', color: '#c0392b', marginBottom: '12px' }}>
                {approveError}
              </p>
            )}

            <button
              onClick={handleApprove}
              disabled={approving || !finalPrice}
              style={{
                width: '100%',
                background: approving || !finalPrice ? '#cccccc' : '#f0ebe4',
                color: '#0d0d0d',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                padding: '16px',
                borderRadius: '2px',
                border: 'none',
                cursor: approving || !finalPrice ? 'not-allowed' : 'pointer',
              }}
            >
              {approving ? 'Publishing...' : 'Approve & Publish'}
            </button>

            <p style={{ fontSize: '10px', color: '#444', marginTop: '10px', textAlign: 'center' }}>
              Listing will expire in 24 hours after publishing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
