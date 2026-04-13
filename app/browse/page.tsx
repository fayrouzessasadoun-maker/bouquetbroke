'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ListingCard from '@/components/ListingCard'
import { BRANDS, DUBAI_AREAS } from '@/lib/pricing'
import type { Listing } from '@/lib/types'

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [brand, setBrand] = useState('')
  const [area, setArea] = useState('')

  useEffect(() => {
    fetchListings()
  }, [brand, area])

  async function fetchListings() {
    setLoading(true)
    const now = new Date().toISOString()

    let activeQuery = supabase
      .from('listings')
      .select('*')
      .eq('is_approved', true)
      .eq('is_sold', false)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })

    let soldQuery = supabase
      .from('listings')
      .select('*')
      .eq('is_approved', true)
      .eq('is_sold', true)
      .order('created_at', { ascending: false })

    if (brand) {
      activeQuery = activeQuery.eq('brand', brand)
      soldQuery = soldQuery.eq('brand', brand)
    }
    if (area) {
      activeQuery = activeQuery.eq('area', area)
      soldQuery = soldQuery.eq('area', area)
    }

    const [{ data: activeData }, { data: soldData }] = await Promise.all([activeQuery, soldQuery])
    const active = (activeData as Listing[]) || []
    const sold = (soldData as Listing[]) || []
    setListings([...active, ...sold])
    setLoading(false)
  }

  const selectStyle = {
    background: '#1a1a1a',
    border: '1px solid #222',
    borderRadius: '2px' as const,
    color: '#cccccc',
    fontSize: '10px',
    letterSpacing: '0.12em',
    padding: '10px 14px',
    cursor: 'pointer',
    width: 'auto',
    minWidth: '160px',
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <p
          style={{
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#aaaaaa',
            marginBottom: '12px',
          }}
        >
          Dubai Flower Resale
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '42px',
            fontWeight: 300,
            color: '#ffffff',
          }}
        >
          Browse Listings
        </h1>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '32px',
          paddingBottom: '32px',
          borderBottom: '1px solid #1a1a1a',
        }}
      >
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Areas</option>
          {DUBAI_AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Brands</option>
          {BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {(brand || area) && (
          <button
            onClick={() => {
              setBrand('')
              setArea('')
            }}
            style={{
              background: 'none',
              border: '1px solid #222',
              borderRadius: '2px',
              color: '#aaaaaa',
              fontSize: '10px',
              letterSpacing: '0.12em',
              padding: '10px 14px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}

        <span
          style={{
            marginLeft: 'auto',
            fontSize: '10px',
            letterSpacing: '0.12em',
            color: '#444',
          }}
        >
          {loading ? '—' : listings.length} listings
        </span>
      </div>

      {/* Listings grid */}
      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#444',
            }}
          >
            Loading...
          </p>
        </div>
      ) : listings.length > 0 ? (
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
            fontSize: '22px',
            fontStyle: 'italic',
            color: '#aaaaaa',
            textAlign: 'center',
            padding: '80px 0',
          }}
        >
          No listings right now. Check back soon.
        </p>
      )}
    </div>
  )
}
