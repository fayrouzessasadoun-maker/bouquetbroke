create table public.listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  expires_at timestamptz,
  user_id uuid references auth.users(id),
  title text,
  description text,
  photo_url text,
  brand text,
  size text,
  area text,
  whatsapp text,
  ai_price numeric,
  ai_reasoning text,
  ai_brand text,
  ai_size text,
  ai_flowers text,
  ai_packaging text,
  is_approved boolean default false,
  is_sold boolean default false
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  listing_id uuid references public.listings(id),
  stripe_session_id text,
  buyer_email text,
  amount_total numeric
);

alter table public.listings enable row level security;
alter table public.orders enable row level security;

create policy "Anyone can view approved listings"
  on public.listings for select
  using (is_approved = true);

create policy "Users can insert their own listings"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "Service role can do everything"
  on public.listings for all
  using (true);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address text;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS photo_urls text[];
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS retail_price numeric;
UPDATE public.listings SET retail_price = 1075 WHERE brand = 'Florette';
