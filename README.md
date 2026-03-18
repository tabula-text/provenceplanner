# Provence Planner 🗺️

A full-stack trip planning SPA for coordinating a Southern France family vacation. Built with **Next.js 16**, **Supabase PostgreSQL**, and **Vercel deployment**.

## Quick Start

### 1. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier works fine)
2. In the SQL Editor, create the 8 tables using this SQL:

```sql
-- Flights
CREATE TABLE flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airline TEXT NOT NULL,
  departure_at TIMESTAMP NOT NULL,
  arrival_at TIMESTAMP NOT NULL,
  route TEXT NOT NULL,
  confirmation_ref TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trains
CREATE TABLE trains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator TEXT NOT NULL,
  departure_at TIMESTAMP NOT NULL,
  arrival_at TIMESTAMP NOT NULL,
  route TEXT NOT NULL,
  booking_ref TEXT,
  seat TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Hotels
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  location TEXT NOT NULL,
  confirmation_ref TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Dinners
CREATE TABLE dinners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  cuisine_or_theme TEXT NOT NULL,
  assigned_cook TEXT,
  notes TEXT,
  is_private_chef BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Restaurants
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Places
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  url TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Packing
CREATE TABLE packing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item TEXT NOT NULL,
  category TEXT NOT NULL,
  packed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Calendar Events (manual events)
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

3. Enable Row Level Security (RLS) is **NOT required** for this family app, but feel free to set it up for security

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_TRIP_PASSWORD=your-chosen-password
```

Get your credentials from **Settings > API** in your Supabase project.

### 3. Run Locally

```bash
npm install  # Already done, but run again if needed
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000), enter your trip password, and start planning!

## Features

✅ **Calendar View** — Aggregated view of all trip events (flights, trains, hotels, dinners, manual events)
✅ **Flights** — Add, edit, delete flight bookings with dates and confirmation refs
✅ **Trains** — Manage train tickets with seat numbers and booking details
✅ **Hotels** — Track hotel reservations with check-in/out dates
✅ **Dinners** — Plan family dinners and assign cooks
✅ **Restaurants** — Save restaurant recommendations with links
✅ **Places** — Curate must-see destinations with priority levels
✅ **Packing** — Interactive checklist with categories and progress tracking
✅ **Password Protection** — Lightweight auth with session cookies (no user accounts)
✅ **Responsive Design** — Works on mobile, tablet, desktop
✅ **Dark Mode** — Tailwind CSS with automatic dark mode

## Architecture

```
Frontend: Next.js 16 App Router (TypeScript, Tailwind CSS)
  ├── Pages (8 sections + auth + calendar)
  ├── Client Components (forms, lists, interactive UI)
  └── Server Components (layout, data fetching)

Backend: Supabase PostgreSQL + REST API
  └── 8 tables + Row Level Security (optional)

Deployment: Vercel + Environment Variables
```

## Key Files

- **`app/layout.tsx`** — Root layout with dark mode
- **`app/(app)/layout.tsx`** — Authenticated app layout with sidebar
- **`app/(app)/calendar/page.tsx`** — Calendar aggregation page
- **`app/(app)/{flights,trains,hotels,dinners,restaurants,places,packing}/**` — Section pages
- **`components/*.tsx`** — Reusable CRUD components
- **`lib/db.ts`** — Database query functions
- **`lib/types.ts`** — TypeScript type definitions
- **`proxy.ts`** — Password authentication middleware

## Deployment to Vercel

1. **Create Vercel Project**
   ```bash
   npm install -g vercel
   vercel link
   ```

2. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add NEXT_PUBLIC_TRIP_PASSWORD
   ```

3. **Deploy**
   ```bash
   vercel deploy --prod
   ```

## Learning Resources

This project teaches:
- **Next.js 16** — App Router, Server/Client Components, API routes
- **Supabase** — PostgreSQL, REST API, environment variable configuration
- **TypeScript** — Type definitions, async/await patterns
- **Tailwind CSS** — Responsive design, dark mode
- **Form Handling** — Create, Read, Update, Delete (CRUD) patterns
- **Authentication** — Session-based auth with cookies
- **State Management** — React hooks (useState, useEffect)
- **Deployment** — Vercel platform and CI/CD integration

## Next Steps / Future Enhancements

- [ ] Add SWR for optimistic updates and caching
- [ ] Implement real-time sync (Supabase subscriptions)
- [ ] Add photo uploads for places/restaurants
- [ ] GPS integration for map view
- [ ] Family member accounts (instead of shared password)
- [ ] Weather integration for trip dates
- [ ] Expense splitting (who paid for dinners)
- [ ] Share trip link with family

## Troubleshooting

**"Supabase credentials missing"**
- Ensure `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**"Cannot connect to database"**
- Check that Supabase project is running (green status in console)
- Verify tables exist in SQL Editor
- Check RLS policies if enabled

**"Password not working"**
- Make sure `NEXT_PUBLIC_TRIP_PASSWORD` in `.env.local` matches what you entered
- Clear browser cookies and try again

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui patterns (buttons, forms)
- **Deployment**: Vercel
- **Auth**: Custom session-based (passwords)

## License

Built as an educational project. Feel free to fork and customize!

---

**Happy trip planning!** 🏖️ Have an amazing vacation in Provence!
