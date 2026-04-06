import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    const { listingId, price, title } = await request.json()

    if (!listingId || !price || !title) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
    })

    const bouquetPrice = Math.round(Number(price) * 100)
    const deliveryPrice = 3000
    const platformFee = Math.round(Number(price) * 0.15 * 100)

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: title,
              description: 'Luxury bouquet resale — Bouquet Broke',
            },
            unit_amount: bouquetPrice,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: 'Delivery (Quiqup)',
              description: 'Same-day delivery within Dubai',
            },
            unit_amount: deliveryPrice,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: 'Platform fee (15%)',
              description: 'Bouquet Broke service fee',
            },
            unit_amount: platformFee,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success`,
      cancel_url: `${origin}/listing/${listingId}`,
      metadata: {
        listingId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 })
  }
}
