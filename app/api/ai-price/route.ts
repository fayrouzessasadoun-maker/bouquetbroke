import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { PRICING_TABLE } from '@/lib/pricing'

export async function POST(request: Request) {
  try {
    const { listingId } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: 'Missing listingId.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
    }

    if (!listing.photo_url) {
      return NextResponse.json({ error: 'Listing has no photo.' }, { status: 400 })
    }

    const imageResponse = await fetch(listing.photo_url)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image.' }, { status: 500 })
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    const brand = listing.brand || 'Other / Unknown'
    const size = listing.size || 'Medium'
    const basePrice = PRICING_TABLE[brand]?.[size] ?? 100

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: contentType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `You are a Dubai luxury flower market pricing expert. You price bouquets for resale on a marketplace called Bouquet Broke.

The seller has indicated this bouquet is from: ${brand}, size: ${size}.
The base resale price from our pricing table for this brand and size is: AED ${basePrice}.

Analyse the bouquet photo carefully. Consider:
1. Does the bouquet match the stated brand's style and packaging?
2. Does the size match what was selected (Small / Medium / Large / Premium)?
3. What flowers are visible and what condition are they in?
4. What is the packaging style (circle box, wrapped bouquet, vase, hat box, other)?
5. Is the bouquet fresh and full, or sparse and wilting?

Based on your analysis, suggest a fair resale price. You may adjust up to 20% above or below the base price based on condition and accuracy. If the bouquet looks exceptional, price higher. If it looks sparse or wilting, price lower.

Return ONLY a valid JSON object with no markdown formatting:
{ "suggestedPrice": number, "detectedBrand": string, "detectedSize": string, "flowers": string, "packaging": string, "condition": string, "reasoning": string }`,
            },
          ],
        },
      ],
      system: 'You are a Dubai luxury flower pricing expert. Always respond with valid JSON only, no markdown.',
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'AI returned no text response.' }, { status: 500 })
    }

    let parsed
    try {
      const cleaned = textContent.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON.' }, { status: 500 })
    }

    await supabase
      .from('listings')
      .update({
        ai_price: parsed.suggestedPrice,
        ai_reasoning: parsed.reasoning,
        ai_brand: parsed.detectedBrand,
        ai_size: parsed.detectedSize,
        ai_flowers: parsed.flowers,
        ai_packaging: parsed.packaging,
      })
      .eq('id', listingId)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('AI price error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
