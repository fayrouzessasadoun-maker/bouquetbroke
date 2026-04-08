'use client'

import { useState, useEffect } from 'react'

interface Props {
  expiresAt: string
  className?: string
}

export default function CountdownTimer({ expiresAt, className }: Props) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)
  const [isUnder3Hours, setIsUnder3Hours] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const expiry = new Date(expiresAt)
      const diff = expiry.getTime() - now.getTime()

      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft('Ended')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setIsUnder3Hours(hours < 3)

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  return (
    <span
      className={className}
      style={{
        color: isExpired ? '#888' : isUnder3Hours ? '#c0392b' : '#888',
        fontSize: '10px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontFamily: "'Jost', system-ui, sans-serif",
      }}
    >
      {timeLeft}
    </span>
  )
}
