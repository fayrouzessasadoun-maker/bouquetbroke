'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BRANDS, DUBAI_AREAS, SIZES, SIZE_DESCRIPTIONS } from '@/lib/pricing'
import type { User } from '@supabase/supabase-js'

const STEPS = [
  { n: 1, label: 'Photo' },
  { n: 2, label: 'Brand' },
  { n: 3, label: 'Size' },
  { n: 4, label: 'Location' },
  { n: 5, label: 'Details' },
]

export default function SellPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  // Form state
  const [step, setStep] = useState(1)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
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
  }, [router])

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
  }

  const handleSubmit = async () => {
    if (!user || !photo || !brand || !size || !area) {
      setError('Please complete all required fields.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Upload photo
      const ext = photo.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bouquets')
        .upload(fileName, photo, { contentType: photo.type })

      if (uploadError) {
        setError('Photo upload failed. Please try again.')
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('bouquets').getPublicUrl(uploadData.path)

      // Insert listing
      const { error: insertError } = await supabase.from('listings').insert({
        user_id: user.id,
        brand,
        size,
        area,
        description: description.trim() || null,
        whatsapp: whatsapp.trim() || null,
        photo_url: publicUrl,
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
    color: '#e8e0d8',
    fontSize: '13px',
    fontWeight: 300,
    padding: '12px 14px',
    width: '100%',
  }

  const labelStyle = {
    fontSize: '10px',
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    color: '#555',
    display: 'block',
    marginBottom: '8px',
  }

  if (authLoading) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.16em', color: '#444' }}>Loading...</p>
      </div>
    )
  }

  if (!user) return null

  if (submitted) {
    return (
      <div
        style={{
          maxWidth: '560px',
          margin: '0 auto',
          padding: '120px 24px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#c0392b',
            marginBottom: '20px',
          }}
        >
          Submitted
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '36px',
            fontWeight: 300,
            color: '#e8e0d8',
            marginBottom: '20px',
          }}
        >
          We&apos;ve got it.
        </h1>
        <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.7, marginBottom: '32px' }}>
          Your listing is being reviewed. We&apos;ll price it and publish within the hour.
        </p>
        <button
          onClick={() => router.push('/browse')}
          style={{
            background: '#f0ebe4',
            color: '#0d0d0d',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            padding: '14px 28px',
            borderRadius: '2px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Browse Listings
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '60px 24px' }}>
      {/* Header */}
      <p
        style={{
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#555',
          marginBottom: '12px',
        }}
      >
        Sell Your Bouquet
      </p>
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '40px',
          fontWeight: 300,
          color: '#e8e0d8',
          marginBottom: '8px',
        }}
      >
        List for Resale
      </h1>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '48px' }}>
        We price it. You get paid.
      </p>

      {/* Step indicators */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '48px',
        }}
      >
        {STEPS.map((s) => (
          <div
            key={s.n}
            style={{
              flex: 1,
              height: '2px',
              background: step >= s.n ? '#e8e0d8' : '#222',
              transition: 'background 0.2s ease',
            }}
          />
        ))}
      </div>

      {/* Step label */}
      <p
        style={{
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#555',
          marginBottom: '32px',
        }}
      >
        Step {step} of {STEPS.length} — {STEPS[step - 1].label}
      </p>

      {/* Step 1: Photo */}
      {step === 1 && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            style={{ display: 'none' }}
          />

          {photoPreview ? (
            <div style={{ marginBottom: '24px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Preview"
                style={{
                  width: '100%',
                  aspectRatio: '4/3',
                  objectFit: 'cover',
                  borderRadius: '2px',
                  border: '1px solid #222',
                  display: 'block',
                  marginBottom: '12px',
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  background: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '2px',
                  color: '#888',
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  padding: '10px 16px',
                  cursor: 'pointer',
                }}
              >
                Change Photo
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100%',
                aspectRatio: '4/3',
                background: '#111',
                border: '1px dashed #333',
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: '24px', color: '#333' }}>+</span>
              <span
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#444',
                }}
              >
                Upload Photo
              </span>
              <span style={{ fontSize: '11px', color: '#333' }}>
                JPG, PNG or WEBP · Max 10MB
              </span>
            </button>
          )}

          <button
            onClick={() => {
              if (!photo) {
                setError('Please upload a photo of your bouquet.')
                return
              }
              setError('')
              setStep(2)
            }}
            style={{
              width: '100%',
              background: '#f0ebe4',
              color: '#0d0d0d',
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              padding: '14px',
              borderRadius: '2px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Brand */}
      {step === 2 && (
        <div>
          <label style={labelStyle}>Select Brand</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            style={{ ...inputStyle, marginBottom: '24px' }}
          >
            <option value="">— Choose brand</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid #333',
                borderRadius: '2px',
                color: '#888',
                fontSize: '10px',
                letterSpacing: '0.12em',
                padding: '14px',
                cursor: 'pointer',
              }}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!brand) { setError('Please select a brand.'); return }
                setError('')
                setStep(3)
              }}
              style={{
                flex: 2,
                background: '#f0ebe4',
                color: '#0d0d0d',
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                padding: '14px',
                borderRadius: '2px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Size */}
      {step === 3 && (
        <div>
          <label style={labelStyle}>Select Size</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                style={{
                  background: size === s ? '#1a1a1a' : '#111',
                  border: `1px solid ${size === s ? '#444' : '#222'}`,
                  borderRadius: '2px',
                  padding: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <p
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: size === s ? '#e8e0d8' : '#888',
                    marginBottom: '4px',
                  }}
                >
                  {s}
                </p>
                <p style={{ fontSize: '12px', color: '#555' }}>
                  {SIZE_DESCRIPTIONS[s]}
                </p>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setStep(2)}
              style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid #333',
                borderRadius: '2px',
                color: '#888',
                fontSize: '10px',
                letterSpacing: '0.12em',
                padding: '14px',
                cursor: 'pointer',
              }}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!size) { setError('Please select a size.'); return }
                setError('')
                setStep(4)
              }}
              style={{
                flex: 2,
                background: '#f0ebe4',
                color: '#0d0d0d',
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                padding: '14px',
                borderRadius: '2px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Location */}
      {step === 4 && (
        <div>
          <label style={labelStyle}>Dubai Area</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            style={{ ...inputStyle, marginBottom: '24px' }}
          >
            <option value="">— Choose area</option>
            {DUBAI_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setStep(3)}
              style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid #333',
                borderRadius: '2px',
                color: '#888',
                fontSize: '10px',
                letterSpacing: '0.12em',
                padding: '14px',
                cursor: 'pointer',
              }}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!area) { setError('Please select an area.'); return }
                setError('')
                setStep(5)
              }}
              style={{
                flex: 2,
                background: '#f0ebe4',
                color: '#0d0d0d',
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                padding: '14px',
                borderRadius: '2px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Details + submit */}
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
            <p
              style={{
                fontSize: '12px',
                color: '#c0392b',
                marginBottom: '16px',
                letterSpacing: '0.04em',
              }}
            >
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setStep(4)}
              style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid #333',
                borderRadius: '2px',
                color: '#888',
                fontSize: '10px',
                letterSpacing: '0.12em',
                padding: '14px',
                cursor: 'pointer',
              }}
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 2,
                background: loading ? '#888' : '#f0ebe4',
                color: '#0d0d0d',
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                padding: '14px',
                borderRadius: '2px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Submitting...' : 'Submit Listing'}
            </button>
          </div>
        </div>
      )}

      {error && step < 5 && (
        <p
          style={{
            fontSize: '12px',
            color: '#c0392b',
            marginTop: '16px',
            letterSpacing: '0.04em',
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
