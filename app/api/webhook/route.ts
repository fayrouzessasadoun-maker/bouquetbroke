import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const listingId = session.metadata?.listingId

    if (listingId) {
      const supabase = createAdminClient()

      await supabase
        .from('listings')
        .update({ is_sold: true })
        .eq('id', listingId)

      const addr = session.shipping_details?.address
      const shippingAddress = addr
        ? [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country]
            .filter(Boolean)
            .join(', ')
        : null

      await supabase.from('orders').insert({
        listing_id: listingId,
        stripe_session_id: session.id,
        buyer_email: session.customer_details?.email || null,
        amount_total: session.amount_total ? session.amount_total / 100 : null,
        shipping_address: shippingAddress,
      })
    }
  }

  return NextResponse.json({ received: true })
}
