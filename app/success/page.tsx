import Link from 'next/link'

export default function SuccessPage() {
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
          color: '#555',
          marginBottom: '20px',
        }}
      >
        Order Confirmed
      </p>

      <h1
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(32px, 6vw, 52px)',
          fontWeight: 300,
          color: '#e8e0d8',
          lineHeight: 1.2,
          marginBottom: '24px',
        }}
      >
        Your bouquet is on its way.
      </h1>

      <hr
        style={{
          border: 'none',
          borderTop: '1px solid #222',
          maxWidth: '200px',
          margin: '0 auto 24px',
        }}
      />

      <p
        style={{
          fontSize: '13px',
          color: '#888',
          lineHeight: 1.8,
          marginBottom: '48px',
        }}
      >
        Delivery arranged within 4 hours via Quiqup.
        <br />
        You will receive a WhatsApp confirmation shortly.
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          href="/browse"
          style={{
            background: '#f0ebe4',
            color: '#0d0d0d',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            padding: '14px 28px',
            borderRadius: '2px',
            display: 'inline-block',
          }}
        >
          Browse More
        </Link>
        <Link
          href="/"
          style={{
            background: 'transparent',
            color: '#888',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            padding: '14px 28px',
            borderRadius: '2px',
            border: '1px solid #333',
            display: 'inline-block',
          }}
        >
          Home
        </Link>
      </div>
    </div>
  )
}
