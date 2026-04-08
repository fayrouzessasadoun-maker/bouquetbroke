'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BRANDS, DUBAI_AREAS, SIZES, SIZE_DESCRIPTIONS } from '@/lib/pricing'
import type { User } from '@supabase/supabase-js'

const STEPS = [
  { n: 1, label: 'Photos' },
  { n: 2, label: 'Brand' },
  { n: 3, label: 'Size' },
  { n: 4, label: 'Location' },
  { n: 5, label: 'Details' },
]

const MIN_PHOTOS = 2
const MAX_PHOTOS = 4

export default function SellPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  // Form state
  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [brand, setBrand] = useState('')
  const [size, setSize] = useState('')
  const [area, setArea] = useState('')
  const [description, setDescription] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      setAuthLoading(false)
      if (!u) {
        router.replace('/login?redirect=/sell')
      }
    })
    // Detect mobile
    setIsMobile(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent))
  }, [router])

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (photos.length >= MAX_PHOTOS) return

    const url = URL.createObjectURL(file)
    setPhotos((prev) => [...prev, file])
    setPhotoPreviews((prev) => [...prev, url])
    // Reset so same photo can be re-taken if needed
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!user || photos.length < MIN_PHOTOS || !brand || !size || !area) {
      setError('Please complete all required fields.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Upload all photos
      const uploadedUrls: string[] = []

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        const ext = photo.name.split('.').pop() || 'jpg'
        const fileName = `${user.id}_${Date.now()}_${i}.${ext}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('bouquets')
          .upload(fileName, photo, { contentType: photo.type })

        if (uploadError) {
          setError(`Photo ${i + 1} upload failed. Please try again.`)
          setLoading(false)
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('bouquets')
          .getPublicUrl(uploadData.path)

        uploadedUrls.push(publicUrl)
      }

      // Insert listing — first photo in photo_url for backwards compat, all in photo_urls
      const { error: insertError } = await supabase.from('listings').insert({
        user_id: user.id,
        brand,
        size,
        area,
        description: description.trim() || null,
        whatsapp: whatsapp.trim() || null,
        photo_url: uploadedUrls[0],
        photo_urls: uploadedUrls,
        is_approved: false,
        is_sold: false,
      })

      if (insertError) {
        setError('Failed to submit listing. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: '#0d0d0d',
    border: '1px solid #222',
    borderRadius: '2px' as const,
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 300,
    padding: '12px 14px',
    width: '100%',
  }

  const labelStyle = {
    fontSize: '10px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: '#888',
    display: 'block',
    marginBottom: '8px',
  }

  if (authLoading) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#444' }}>Loading...</p>
      </div>
    )
  }

  if (!user) return null

  if (submitted) {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c0392b', marginBottom: '20px' }}>
          Submitted
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '36px', fontWeight: 300, color: '#ffffff', marginBottom: '20px' }}>
          We&apos;ve got it.
        </h1>
        <p style={{ fontSize: '13px', color: '#cccccc', lineHeight: 1.7, marginBottom: '32px' }}>
          Your listing is being reviewed. We&apos;ll price it and publish within the hour.
        </p>
        <button
          onClick={() => router.push('/browse')}
          style={{ background: '#f0ebe4', color: '#0d0d0d', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '14px 28px', borderRadius: '2px', border: 'none', cursor: 'pointer' }}
        >
          Browse Listings
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '60px 24px' }}>
      {/* Header */}
      <p style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: '12px' }}>
        Sell Your Bouquet
      </p>
      <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '40px', fontWeight: 300, color: '#ffffff', marginBottom: '8px' }}>
        List for Resale
      </h1>
      <p style={{ fontSize: '13px', color: '#cccccc', marginBottom: '48px' }}>
        We price it. You get paid.
      </p>

      {/* Step progress */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '48px' }}>
        {STEPS.map((s) => (
          <div
            key={s.n}
            style={{ flex: 1, height: '2px', background: step >= s.n ? '#ffffff' : '#222', transition: 'background 0.2s ease' }}
          />
        ))}
      </div>

      <p style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: '32px' }}>
        Step {step} of {STEPS.length} — {STEPS[step - 1].label}
      </p>

      {/* ── Step 1: Photos ── */}
      {step === 1 && (
        <div>
          {/* Hidden camera input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            style={{ display: 'none' }}
          />

          {/* Desktop warning */}
          {isMobile === false && (
            <div style={{ padding: '16px', border: '1px solid #333', borderRadius: '2px', marginBottom: '24px', background: '#111' }}>
              <p style={{ fontSize: '12px', color: '#cccccc', lineHeight: 1.7 }}>
                📱 Please use a mobile device to take live photos of your bouquet. Camera roll uploads are not accepted.
              </p>
            </div>
          )}

          {/* Instruction note */}
          <p style={{ fontSize: '11px', color: '#888', lineHeight: 1.7, marginBottom: '20px', letterSpacing: '0.02em' }}>
            Take live photos of your bouquet right now. Camera roll uploads are not accepted to ensure bouquet freshness.
          </p>

          {/* Photo counter */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: photos.length >= MIN_PHOTOS ? '#cccccc' : '#888' }}>
              {photos.length}/{MIN_PHOTOS} photos required
              {photos.length >= MIN_PHOTOS && photos.length < MAX_PHOTOS && ` · ${photos.length}/${MAX_PHOTOS} taken`}
              {photos.length === MAX_PHOTOS && ` · Maximum reached`}
            </span>
          </div>

          {/* Photo thumbnails grid */}
          {photoPreviews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {photoPreviews.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Photo ${i + 1}`}
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '2px', border: '1px solid #222', display: 'block' }}
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(13,13,13,0.85)', border: 'none', borderRadius: '2px', color: '#cccccc', fontSize: '11px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    aria-label="Remove photo"
                  >
                    ✕
                  </button>
                  <span style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(13,13,13,0.85)', fontSize: '9px', letterSpacing: '0.12em', color: '#888', padding: '2px 6px' }}>
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Add photo button — only show if under max */}
          {photos.length < MAX_PHOTOS && (
            <button
              onClick={() => fileRef.current?.click()}
              style={{ width: '100%', padding: '20px', background: '#111', border: '1px dashed #333', borderRadius: '2px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '20px' }}
            >
              <span style={{ fontSize: '22px', color: '#444' }}>+</span>
              <span style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#444' }}>
                {photos.length === 0 ? 'Take First Photo' : `Add Another Photo (${photos.length}/${MAX_PHOTOS})`}
              </span>
            </button>
          )}

          <button
            onClick={() => {
              if (photos.length < MIN_PHOTOS) {
                setError(`Please take at least ${MIN_PHOTOS} photos of your bouquet.`)
                return
              }
              setError('')
              setStep(2)
            }}
            style={{ width: '100%', background: photos.length >= MIN_PHOTOS ? '#f0ebe4' : '#222', color: photos.length >= MIN_PHOTOS ? '#0d0d0d' : '#555', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '14px', borderRadius: '2px', border: 'none', cursor: photos.length >= MIN_PHOTOS ? 'pointer' : 'not-allowed' }}
          >
            Continue
          </button>
        </div>
      )}

      {/* ── Step 2: Brand ── */}
      {step === 2 && (
        <div>
          <label style={labelStyle}>Select Brand</label>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} style={{ ...inputStyle, marginBottom: '24px' }}>
            <option value="">— Choose brand</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, background: 'transparent', border: '1px solid #333', borderRadius: '2px', color: '#cccccc', fontSize: '10px', letterSpacing: '0.12em', padding: '14px', cursor: 'pointer' }}>
              Back
            </button>
            <button onClick={() => { if (!brand) { setError('Please select a brand.'); return } setError(''); setStep(3) }} style={{ flex: 2, background: '#f0ebe4', color: '#0d0d0d', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '14px', borderRadius: '2px', border: 'none', cursor: 'pointer' }}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Size ── */}
      {step === 3 && (
        <div>
          <label style={labelStyle}>Select Size</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                style={{ background: size === s ? '#1a1a1a' : '#111', border: `1px solid ${size === s ? '#444' : '#222'}`, borderRadius: '2px', padding: '16px', cursor: 'pointer', textAlign: 'left' }}
              >
                <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: size === s ? '#ffffff' : '#cccccc', marginBottom: '4px' }}>
                  {s}
                </p>
                <p style={{ fontSize: '12px', color: '#888' }}>
                  {SIZE_DESCRIPTIONS[s]}
                </p>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, background: 'transparent', border: '1px solid #333', borderRadius: '2px', color: '#cccccc', fontSize: '10px', letterSpacing: '0.12em', padding: '14px', cursor: 'pointer' }}>
              Back
            </button>
            <button onClick={() => { if (!size) { setError('Please select a size.'); return } setError(''); setStep(4) }} style={{ flex: 2, background: '#f0ebe4', color: '#0d0d0d', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '14px', borderRadius: '2px', border: 'none', cursor: 'pointer' }}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Location ── */}
      {step === 4 && (
        <div>
          <label style={labelStyle}>Dubai Area</label>
          <select value={area} onChange={(e) => setArea(e.target.value)} style={{ ...inputStyle, marginBottom: '24px' }}>
            <option value="">— Choose area</option>
            {DUBAI_AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(3)} style={{ flex: 1, background: 'transparent', border: '1px solid #333', borderRadius: '2px', color: '#cccccc', fontSize: '10px', letterSpacing: '0.12em', padding: '14px', cursor: 'pointer' }}>
              Back
            </button>
            <button onClick={() => { if (!area) { setError('Please select an area.'); return } setError(''); setStep(5) }} style={{ flex: 2, background: '#f0ebe4', color: '#0d0d0d', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '14px', borderRadius: '2px', border: 'none', cursor: 'pointer' }}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── Step 5: Details + submit ── */}
      {step === 5 && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Description <span style={{ color: '#444' }}>(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 150))}
              placeholder="Brief description of your bouquet..."
              rows={3}
              style={inputStyle}
            />
            <p style={{ fontSize: '10px', color: '#444', marginTop: '6px', textAlign: 'right' }}>
              {description.length}/150
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>WhatsApp Number <span style={{ color: '#444' }}>(optional)</span></label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+971 50 000 0000"
              style={inputStyle}
            />
            <p style={{ fontSize: '10px', color: '#444', marginTop: '6px' }}>
              For delivery coordination only.
            </p>
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#c0392b', marginBottom: '16px', letterSpacing: '0.04em' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(4)} style={{ flex: 1, background: 'transparent', border: '1px solid #333', borderRadius: '2px', color: '#cccccc', fontSize: '10px', letterSpacing: '0.12em', padding: '14px', cursor: 'pointer' }}>
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ flex: 2, background: loading ? '#888' : '#f0ebe4', color: '#0d0d0d', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '14px', borderRadius: '2px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Submitting...' : 'Submit Listing'}
            </button>
          </div>
        </div>
      )}

      {error && step < 5 && (
        <p style={{ fontSize: '12px', color: '#c0392b', marginTop: '16px', letterSpacing: '0.04em' }}>
          {error}
        </p>
      )}
    </div>
  )
}
