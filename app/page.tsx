export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabaseAdmin'
import ListingCard from '@/components/ListingCard'
import LiveTicker from '@/components/LiveTicker'
import type { Listing } from '@/lib/types'

async function getListings(): Promise<Listing[]> {
  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const [{ data: activeData }, { data: soldData }] = await Promise.all([
      supabase
        .from('listings')
        .select('*')
        .eq('is_approved', true)
        .eq('is_sold', false)
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(9),
      supabase
        .from('listings')
        .select('*')
        .eq('is_approved', true)
        .eq('is_sold', true)
        .order('created_at', { ascending: false })
        .limit(3),
    ])

    const active = (activeData as Listing[]) || []
    const sold = (soldData as Listing[]) || []
    return [...active, ...sold]
  } catch {
    return []
  }
}

export const revalidate = 60

export default async function HomePage() {
  const listings = await getListings()

  return (
    <>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          minHeight: '600px',
          overflow: 'hidden',
          background: '#0d0d0d',
        }}
      >
        {/* Hero image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
          }}
        />

        {/* Left overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, #0d0d0d 38%, transparent 72%)',
          }}
        />

        {/* Bottom overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #0d0d0d 0%, transparent 40%)',
          }}
        />

        {/* Top-left label */}
        <div
          style={{
            position: 'absolute',
            top: '28px',
            left: '32px',
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#333',
          }}
        >
          NO. 001 — DUBAI
        </div>

        {/* Hero copy */}
        <div
          style={{
            position: 'absolute',
            bottom: '120px',
            left: '32px',
            maxWidth: '520px',
          }}
        >
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(44px, 7vw, 62px)',
              fontWeight: 300,
              color: '#f0ebe4',
              lineHeight: 1.1,
              marginBottom: '2px',
            }}
          >
            Got flowers?
          </h1>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(44px, 7vw, 62px)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#c0392b',
              lineHeight: 1.1,
              marginBottom: '24px',
            }}
          >
            Get paid.
          </h1>

          <hr
            style={{
              border: 'none',
              borderTop: '1px solid #222',
              marginBottom: '20px',
              width: '280px',
            }}
          />

          <p
            style={{
              fontSize: '13px',
              fontWeight: 300,
              color: '#cccccc',
              letterSpacing: '0.08em',
              marginBottom: '32px',
            }}
          >
            Want flowers? Pay less.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/browse"
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
              Shop Now
            </Link>
            <Link
              href="/sell"
              style={{
                background: 'transparent',
                color: '#cccccc',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                padding: '14px 28px',
                borderRadius: '2px',
                border: '1px solid #333',
                display: 'inline-block',
              }}
            >
              Sell Mine
            </Link>
          </div>
        </div>
      </section>

      {/* Live ticker */}
      <LiveTicker listings={listings} />

      {/* Live listings section */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: '40px',
          }}
        >
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '32px',
              fontWeight: 300,
              color: '#ffffff',
            }}
          >
            Live Listings
          </h2>
          <Link
            href="/browse"
            style={{
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#888',
            }}
          >
            View All
          </Link>
        </div>

        {listings.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '20px',
              fontStyle: 'italic',
              color: '#888',
              textAlign: 'center',
              padding: '60px 0',
            }}
          >
            No listings right now. Check back soon.
          </p>
        )}
      </section>

      {/* AI pricing CTA strip */}
      <section
        style={{
          borderTop: '1px solid #222',
          borderBottom: '1px solid #222',
          padding: '80px 24px',
          textAlign: 'center',
          background: '#0d0d0d',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#888',
            marginBottom: '20px',
          }}
        >
          AI-Powered Pricing
        </p>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 300,
            color: '#ffffff',
            marginBottom: '16px',
          }}
        >
          Drop a photo.{' '}
          <em style={{ color: '#c0392b', fontStyle: 'italic' }}>We price it.</em>
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: '#cccccc',
            letterSpacing: '0.04em',
            marginBottom: '36px',
            maxWidth: '480px',
            margin: '0 auto 36px',
          }}
        >
          Our AI analyses your bouquet, identifies the brand and condition, and sets
          a fair resale price — ready to publish within the hour.
        </p>
        <Link
          href="/sell"
          style={{
            background: '#f0ebe4',
            color: '#0d0d0d',
            fontSize: '10px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            padding: '14px 32px',
            borderRadius: '2px',
            display: 'inline-block',
          }}
        >
          List Your Bouquet
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #1a1a1a',
          padding: '48px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '32px',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '18px',
              fontWeight: 300,
              color: '#ffffff',
              marginBottom: '8px',
            }}
          >
            Bouquet <em style={{ color: '#c0392b' }}>Broke</em>
          </p>
          <p style={{ fontSize: '11px', color: '#444', letterSpacing: '0.04em' }}>
            Dubai luxury flower resale
          </p>
        </div>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {[
            { label: 'Browse', href: '/browse' },
            { label: 'Sell', href: '/sell' },
            { label: 'Login', href: '/login' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#888',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        <p style={{ fontSize: '10px', color: '#333', letterSpacing: '0.08em' }}>
          © {new Date().getFullYear()} Bouquet Broke. All listings expire in 24h.
        </p>
      </footer>
    </>
  )
}
