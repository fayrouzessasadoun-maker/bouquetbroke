export interface Listing {
  id: string
  created_at: string
  expires_at: string | null
  user_id: string | null
  title: string | null
  description: string | null
  photo_url: string | null
  brand: string | null
  size: string | null
  area: string | null
  whatsapp: string | null
  ai_price: number | null
  ai_reasoning: string | null
  ai_brand: string | null
  ai_size: string | null
  ai_flowers: string | null
  ai_packaging: string | null
  is_approved: boolean
  is_sold: boolean
  retail_price: number | null
}

export interface Order {
  id: string
  created_at: string
  listing_id: string | null
  stripe_session_id: string | null
  buyer_email: string | null
  amount_total: number | null
}

export interface AiPriceResult {
  suggestedPrice: number
  detectedBrand: string
  detectedSize: string
  flowers: string
  packaging: string
  condition: string
  reasoning: string
}
