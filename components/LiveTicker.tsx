'use client'

import type { Listing } from '@/lib/types'

interface Props {
  listings: Listing[]
}

export default function LiveTicker({ listings }: Props) {
  if (!listings || listings.length === 0) {
    return null
  }

  const items = [...listings, ...listings] // duplicate for seamless loop

  return (
    <div
      style={{
        borderTop: '1px solid #222',
        borderBottom: '1px solid #222',
        background: '#1a1a1a',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: '10px 0',
      }}
    >
      <div className="ticker-track">
        {items.map((listing, i) => {
          const hoursLeft = listing.expires_at
            ? Math.max(
                0,
                Math.floor(
                  (new Date(listing.expires_at).getTime() - Date.now()) /
                    (1000 * 60 * 60)
                )
              )
            : 0

          return (
            <span
              key={`${listing.id}-${i}`}
              style={{
                display: 'inline-block',
                marginRight: '60px',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#aaaaaa',
              }}
            >
              {listing.brand} &middot; {listing.area} &middot;{' '}
              <span style={{ color: '#c0392b' }}>{hoursLeft}h left</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
