'use client'

import { useState } from 'react'

interface Props {
  listingId: string
  price: number
  title: string
}

export default function CheckoutButton({ listingId, price, title }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, price, title }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        setError(data.error || 'Checkout failed. Please try again.')
        return
      }

      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{
          width: '100%',
          background: loading ? '#cccccc' : '#f0ebe4',
          color: '#0d0d0d',
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          padding: '16px 24px',
          borderRadius: '2px',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s ease',
        }}
      >
        {loading ? 'Redirecting...' : 'Buy Now — Secure Checkout'}
      </button>

      {error && (
        <p
          style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#c0392b',
            letterSpacing: '0.04em',
          }}
        >
          {error}
        </p>
      )}

      <p
        style={{
          marginTop: '12px',
          fontSize: '10px',
          color: '#444',
          letterSpacing: '0.06em',
          textAlign: 'center',
        }}
      >
        Secure payment via Stripe · Delivery in 4h via Quiqup
      </p>
    </div>
  )
}
