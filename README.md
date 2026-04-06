# Bouquet Broke

Dubai luxury flower resale marketplace. Sellers upload bouquets they received, AI prices them automatically, buyers purchase them. All listings expire after 24 hours.

---

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** — database, auth, storage
- **Stripe Checkout** — payments
- **Anthropic Claude** — AI pricing via vision
- **Tailwind CSS**
- **Vercel** — deployment

---

## Local Setup

### 1. Clone & install

```bash
git clone <repo>
cd bouquetbroke
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `ADMIN_PASSWORD` | Password to access `/admin/*` pages |

---

## Supabase Setup

### 1. Create a project

Go to [supabase.com](https://supabase.com), create a new project, and copy your credentials.

### 2. Run the migration

In the Supabase dashboard → SQL Editor, paste and run the contents of:

```
supabase/migrations/001_init.sql
```

This creates the `listings` and `orders` tables with RLS policies.

### 3. Storage bucket

In the Supabase dashboard → Storage → New bucket:

- **Name:** `bouquets`
- **Public bucket:** ✅ enabled

Then add a policy for public read access:
```sql
create policy "Public read access"
  on storage.objects for select
  using (bucket_id = 'bouquets');
```

And a policy for authenticated uploads:
```sql
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (bucket_id = 'bouquets' AND auth.role() = 'authenticated');
```

---

## Stripe Setup

### 1. Create products/webhook

No products need to be created manually — line items are created dynamically per checkout.

### 2. Webhook

In Stripe dashboard → Webhooks → Add endpoint:

- **URL:** `https://yourdomain.com/api/webhook`
- **Events:** `checkout.session.completed`

Copy the signing secret to `STRIPE_WEBHOOK_SECRET`.

### 3. Local webhook testing

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

---

## Hero Image

Add your own `hero.jpg` to the `/public` folder. Recommended: a high-quality portrait-oriented photo of a luxury bouquet, positioned center-right. Minimum 1920×1080px.

---

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel project settings
4. Deploy

The app is configured for Vercel's serverless functions. No additional configuration needed.

---

## Admin Access

Visit `/admin/listings` and enter your `ADMIN_PASSWORD` to access the admin panel.

From there you can:
- View pending (unapproved) listings
- Run AI analysis on each bouquet photo
- Edit the suggested price
- Approve & publish listings (sets expiry to 24h from now)

---

## Flow Summary

1. **Seller** signs up → goes to `/sell` → uploads photo, selects brand/size/area
2. **Admin** reviews at `/admin/listings` → analyses with AI → approves with final price
3. **Buyer** browses `/browse` → clicks listing → sees price breakdown → pays via Stripe
4. On payment: listing marked sold, order recorded, buyer receives WhatsApp confirmation
5. Listing expires automatically after 24h from approval
