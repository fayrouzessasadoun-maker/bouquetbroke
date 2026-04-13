import Link from 'next/link'
import CountdownTimer from './CountdownTimer'
import type { Listing } from '@/lib/types'

interface Props {
  listing: Listing
}

export default function ListingCard({ listing }: Props) {
  console.log('ListingCard photo_url:', listing.photo_url)
  const isSold = listing.is_sold
  const isExpired = listing.expires_at
    ? new Date(listing.expires_at) < new Date()
    : false
  const inactive = isSold || isExpired

  return (
    <Link href={`/listing/${listing.id}`} className="block group">
      <div
        className="relative overflow-hidden"
        style={{
          background: '#111',
          border: '1px solid #222',
          borderRadius: '2px',
          opacity: inactive ? 0.3 : 1,
        }}
      >
        {/* Photo */}
        <div className="relative" style={{ height: '200px' }}>
          {listing.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.photo_url}
              alt={listing.brand || 'Bouquet'}
              style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#333', fontSize: '10px', letterSpacing: '0.18em' }}>
                NO PHOTO
              </span>
            </div>
          )}

          {/* Brand label top-right */}
          <div
            className="absolute top-2 right-2"
            style={{
              fontSize: '9px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#888',
              background: 'rgba(13,13,13,0.85)',
              padding: '3px 6px',
            }}
          >
            {listing.brand || 'Unknown'}
          </div>

          {/* Timer bottom-left */}
          {listing.expires_at && !inactive && (
            <div
              className="absolute bottom-2 left-2"
              style={{
                background: 'rgba(13,13,13,0.85)',
                padding: '3px 6px',
              }}
            >
              <CountdownTimer expiresAt={listing.expires_at} />
            </div>
          )}

          {/* Sold overlay */}
          {isSold && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(13,13,13,0.6)' }}
            >
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                SOLD
              </span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4">
          {/* Size label */}
          <p
            style={{
              fontSize: '9px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: '6px',
            }}
          >
            {listing.size || '—'}
          </p>

          {/* Title / Brand */}
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '17px',
              fontWeight: 300,
              color: '#ffffff',
              marginBottom: '4px',
              lineHeight: '1.3',
            }}
          >
            {listing.brand || 'Bouquet'}
          </h3>

          {/* Area */}
          <p
            style={{
              fontSize: '10px',
              letterSpacing: '0.08em',
              color: '#888',
              marginBottom: '12px',
            }}
          >
            {listing.area || '—'}
          </p>

          {/* Price + Buy */}
          <div className="flex items-center justify-between">
            <div>
              {/* Crossed-out retail price */}
              {listing.retail_price && (
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '13px',
                    fontWeight: 300,
                    color: '#555',
                    textDecoration: 'line-through',
                    marginBottom: '2px',
                    lineHeight: 1,
                  }}
                >
                  AED {listing.retail_price}
                </p>
              )}
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '22px',
                  fontWeight: 300,
                  color: '#ffffff',
                }}
              >
                {listing.ai_price ? `AED ${listing.ai_price}` : '—'}
              </span>
            </div>

            {!inactive && (
              <button
                style={{
                  background: '#f0ebe4',
                  color: '#0d0d0d',
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  padding: '8px 14px',
                  borderRadius: '2px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Buy
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
