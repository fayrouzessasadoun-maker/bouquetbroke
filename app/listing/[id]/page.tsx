export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabaseAdmin'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CountdownTimer from '@/components/CountdownTimer'
import CheckoutButton from './CheckoutButton'
import type { Listing } from '@/lib/types'

interface Props {
  params: { id: string }
}

async function getListing(id: string): Promise<Listing | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data as Listing
  } catch {
    return null
  }
}

export default async function ListingPage({ params }: Props) {
  const listing = await getListing(params.id)

  if (!listing) notFound()

  const now = new Date()
  const isExpired = listing.expires_at ? new Date(listing.expires_at) < now : false
  const isSold = listing.is_sold
  const isActive = listing.is_approved && !isExpired && !isSold

  const price = listing.ai_price || 0
  const delivery = 30
  const platformFee = Math.round(price * 0.10)
  const total = price + delivery + platformFee

  const label = {
    fontSize: '10px',
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    color: '#555',
    marginBottom: '6px',
    display: 'block',
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px' }}>
      {/* Back */}
      <Link
        href="/browse"
        style={{
          fontSize: '10px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#555',
          display: 'inline-block',
          marginBottom: '40px',
        }}
      >
        ← Browse
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '48px',
          alignItems: 'start',
        }}
      >
        {/* Photo */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '3/4',
              background: '#111',
              border: '1px solid #222',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            {listing.photo_url ? (
              <Image
                src={listing.photo_url}
                alt={listing.brand || 'Bouquet'}
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
                  letterSpacing: '0.16em',
                }}
              >
                NO PHOTO
              </div>
            )}

            {isSold && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(13,13,13,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    color: '#e8e0d8',
                    fontSize: '12px',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                  }}
                >
                  SOLD
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          {/* Status messages */}
          {isSold && (
            <div
              style={{
                padding: '14px',
                border: '1px solid #222',
                borderRadius: '2px',
                marginBottom: '24px',
              }}
            >
              <p style={{ fontSize: '12px', color: '#555', letterSpacing: '0.08em' }}>
                This bouquet has been sold
              </p>
            </div>
          )}

          {isExpired && !isSold && (
            <div
              style={{
                padding: '14px',
                border: '1px solid #222',
                borderRadius: '2px',
                marginBottom: '24px',
              }}
            >
              <p style={{ fontSize: '12px', color: '#555', letterSpacing: '0.08em' }}>
                This listing has ended
              </p>
            </div>
          )}

          {/* Brand + size */}
          <div style={{ marginBottom: '24px' }}>
            <span style={label}>{listing.size}</span>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '36px',
                fontWeight: 300,
                color: '#e8e0d8',
                lineHeight: 1.2,
                marginBottom: '4px',
              }}
            >
              {listing.brand}
            </h1>
            <p style={{ fontSize: '12px', color: '#555', letterSpacing: '0.06em' }}>
              {listing.area}
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #1a1a1a', marginBottom: '24px' }} />

          {/* Description */}
          {listing.description && (
            <div style={{ marginBottom: '24px' }}>
              <span style={label}>Description</span>
              <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>
                {listing.description}
              </p>
            </div>
          )}

          {/* AI price */}
          {listing.ai_price && (
            <div style={{ marginBottom: '24px' }}>
              <span style={label}>Resale Price</span>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '52px',
                  fontWeight: 300,
                  color: '#e8e0d8',
                  lineHeight: 1,
                }}
              >
                AED {listing.ai_price}
              </p>
            </div>
          )}

          {/* Timer */}
          {listing.expires_at && !isSold && !isExpired && (
            <div style={{ marginBottom: '24px' }}>
              <span style={label}>Time Remaining</span>
              <CountdownTimer expiresAt={listing.expires_at} />
            </div>
          )}

          {/* Price breakdown */}
          {listing.ai_price && isActive && (
            <div
              style={{
                background: '#111',
                border: '1px solid #222',
                borderRadius: '2px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <span style={{ ...label, marginBottom: '16px' }}>Price Breakdown</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Bouquet', amount: price },
                  { label: 'Delivery (Quiqup)', amount: delivery },
                  { label: 'Platform fee (10%)', amount: platformFee },
                ].map(({ label: lbl, amount }) => (
                  <div
                    key={lbl}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#555', letterSpacing: '0.04em' }}>
                      {lbl}
                    </span>
                    <span style={{ fontSize: '13px', color: '#888' }}>AED {amount}</span>
                  </div>
                ))}
                <hr style={{ border: 'none', borderTop: '1px solid #1a1a1a', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: '#e8e0d8',
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '22px',
                      fontWeight: 300,
                      color: '#e8e0d8',
                    }}
                  >
                    AED {total}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Checkout button */}
          {isActive && listing.ai_price && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Pay via Ziina */}
              <a
                href="https://ziina.com/bouquetbroke"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  background: '#f0ebe4',
                  color: '#0d0d0d',
                  fontSize: '10px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  padding: '16px 24px',
                  borderRadius: '2px',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Pay via Ziina — AED {total}
              </a>

              <p
                style={{
                  fontSize: '11px',
                  color: '#555',
                  lineHeight: 1.7,
                  letterSpacing: '0.02em',
                  textAlign: 'center',
                }}
              >
                After payment, WhatsApp us at{' '}
                <a
                  href="https://wa.me/971500000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#888', textDecoration: 'underline' }}
                >
                  +971 50 000 0000
                </a>{' '}
                with your delivery address and payment screenshot to confirm your order.
              </p>

              {/* Stripe checkout — disabled for now */}
              {/* <CheckoutButton
                listingId={listing.id}
                price={listing.ai_price}
                title={`${listing.brand} — ${listing.size}`}
              /> */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
