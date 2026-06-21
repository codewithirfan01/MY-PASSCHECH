# PassCheck

A free, privacy-first password & account security toolkit — password breach checking,
strength scoring, a secure password generator, and a public user reviews wall.

## Tech stack
- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- Supabase (free tier) for auth and database
- Have I Been Pwned public API (free, no key) for breach checks, using the k-anonymity method
  (only the first 5 characters of a SHA-1 hash are ever sent — the password itself never
  leaves the browser)

## Project structure (key files)
- `src/pages/` — route-level pages (landing, signup, login, dashboard, profile, privacy, reviews)
- `src/components/` — shared UI (navbar, footer, star rating, reviews teaser, auth guard)
- `src/lib/` — supabase client, crypto helpers, password strength logic, reviews/history data access
- `src/hooks/use-auth.ts` — reactive Supabase auth session hook
- `supabase/migrations/` — SQL migrations for `check_history` and `reviews` tables (with Row
  Level Security policies)

## 1. Set up Supabase (free)
1. Create a free project at https://supabase.com
2. In your Supabase project, go to the SQL Editor and run the two migration files in
   `supabase/migrations/` (in order) — this creates the `check_history` and `reviews` tables
   with Row Level Security already configured.
3. Go to Project Settings → API and copy your **Project URL** and **anon public key**.

## 2. Configure environment variables
Create a `.env` file in the project root (a `.env.example`-style reference is below):

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 3. Run locally
```
npm install
npm run dev
```

## 4. Deploy to Vercel (free)
1. Push this project to a GitHub repository.
2. Go to https://vercel.com → "Add New Project" → import your GitHub repo.
3. In the Vercel project settings, add the same two environment variables
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) under Settings → Environment Variables.
4. Deploy. Vercel auto-detects the Vite build (`npm run build`, output directory `dist`).
   The included `vercel.json` ensures client-side routes (like `/dashboard`) don't 404 on
   page refresh.

## Privacy & ethics notes (for assignment evidence)
- Passwords are never transmitted or stored — only a 5-character SHA-1 prefix is sent to the
  Have I Been Pwned API (k-anonymity).
- `check_history` stores only anonymized result summaries (e.g. "Strong, not breached"), never
  the password or email itself.
- The Reviews feature doubles as the assignment's required genuine user feedback mechanism:
  each review captures a star rating, "what was useful," and "what would you improve," matching
  the feedback form requirements in the assignment brief.
