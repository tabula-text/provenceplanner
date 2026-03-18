# Provence Planner — Implementation Plan

## Context

Building a trip planning SPA for a Southern France vacation with family. The app needs to be:
- A **calendar-centric interface** — the hero feature, landing page
- **UUID-linked event aggregation** — flights, trains, hotels, dinners, restaurants, places, packing all feed into one calendar view
- **Single-password protected** — lightweight auth, no full user accounts
- **Deployed on Vercel** — with Supabase backend
- **Educational** — learning full-stack patterns: database design, Next.js App Router, realtime data, deployment

## Architecture Overview

**Frontend:** Next.js 16 App Router SPA with sidebar navigation + 7 section pages
**Backend:** Supabase PostgreSQL with REST API
**Deployment:** Vercel + environment variables
**Password:** Single shared password via middleware + session cookie

### Data Model

**8 Supabase tables:**
- `flights` (id, airline, departure_at, arrival_at, route, confirmation_ref, notes)
- `trains` (id, operator, departure_at, arrival_at, route, booking_ref, seat, notes)
- `hotels` (id, name, check_in, check_out, location, confirmation_ref, notes)
- `dinners` (id, date, cuisine_or_theme, assigned_cook, notes, is_private_chef)
- `restaurants` (id, name, location, cuisine, url, notes)
- `places` (id, name, description, location, url, priority)
- `packing` (id, item, category, packed)
- `calendar_events` (id, date, title, notes)

**Calendar aggregation:** UNION query across flights/trains/hotels/dinners filtered by date, plus manual calendar_events.

### File Structure

```
/app
  /(auth)
    password-guard.tsx         ← Password form + session check
  /(app)
    layout.tsx                 ← Sidebar + main layout
    page.tsx                   ← Calendar (landing)
    calendar/page.tsx
    flights/[page.tsx, [id]/page.tsx]
    trains/[page.tsx, [id]/page.tsx]
    hotels/[page.tsx, [id]/page.tsx]
    dinners/[page.tsx, [id]/page.tsx]
    restaurants/page.tsx
    places/page.tsx
    packing/page.tsx
/lib
  supabase.ts                  ← Supabase client
  db.ts                        ← Database queries (getCalendarEvents, getFlights, etc.)
  types.ts                     ← TypeScript types
  constants.ts                 ← Trip dates, password hash
/components
  Sidebar.tsx
  Calendar.tsx
  EventCard.tsx
  ListPage.tsx (reusable for flights, trains, etc.)
  DetailPage.tsx (reusable for individual records)
/styles
  globals.css
```

## Implementation Steps

### Phase 1: Scaffold & Setup (30 min)
1. Create Next.js 16 project with TypeScript
2. Install dependencies: Supabase, Tailwind, shadcn/ui, SWR
3. Set up Supabase project (free tier) and create 8 tables with schema
4. Create `.env.local` with Supabase URL + anon key + TRIP_PASSWORD
5. Set up `/lib/supabase.ts` client
6. Set up TypeScript types in `/lib/types.ts`

### Phase 2: Auth & Layout (45 min)
1. Build password gate middleware + session handling
2. Create main `/app/(app)/layout.tsx` with Sidebar
3. Build `Sidebar.tsx` component with navigation
4. Add basic styling (Tailwind + dark mode)
5. Test password flow and nav between pages

### Phase 3: Calendar Feature (90 min)
1. Build `db.getCalendarEvents()` — UNION query pulling all event types
2. Build `Calendar.tsx` component — month view grid, click to add manual events
3. Build `calendar/page.tsx` — container for Calendar component
4. Add color coding by event type (flights = blue, trains = orange, hotels = green, dinners = red)
5. Test aggregation end-to-end

### Phase 4: CRUD Pages (120 min)
1. Build reusable `ListPage.tsx` component for displaying tables
2. Build reusable `DetailPage.tsx` component for add/edit forms
3. Create pages for each section:
   - `flights/page.tsx` → list all flights
   - `flights/[id]/page.tsx` → edit individual flight
   - Repeat for trains, hotels, dinners
   - `restaurants/page.tsx`, `places/page.tsx`, `packing/page.tsx` (list-only, simpler forms)
4. Connect CRUD operations to Supabase via `/lib/db.ts`
5. Add SWR for client-side caching & optimistic UI

### Phase 5: Polish & Deploy (60 min)
1. Add error handling, loading states, empty states
2. Test realtime sync (open two browser tabs, edit something)
3. Add responsive design (mobile sidebar collapse)
4. Create Vercel project, link Supabase env vars
5. Deploy to Vercel
6. Test production deployment

## Key Technical Decisions

| Decision | Why |
|----------|-----|
| **UUID primary keys** | Supabase default; teaches distributed ID concepts |
| **UNION query for calendar** | Real SQL pattern; scales to any new event type |
| **Client-side password validation** | Fast, simple, good enough for family sharing |
| **SWR for data fetching** | Built-in caching, revalidation, optimistic updates |
| **Tailwind + shadcn/ui** | Fast styling, accessible components, extensible |
| **No full auth system** | Scope is tight; single password is sufficient |

## Verification Plan

**During development:**
- Run `npm run dev` after each phase, test manually
- Add sample data to Supabase to test aggregation
- Test password gate with wrong/correct passwords
- Test navigation between all sections

**Before deployment:**
- Test calendar month view, click to add event, see all event types
- Test adding flight → see it appear on calendar automatically
- Test editing flight time → calendar updates
- Test packing checklist (simpler, no date field)
- Test mobile responsiveness (sidebar collapse)
- Load test (open two windows, edit simultaneously)

**After deployment:**
- Visit production URL, test full flow
- Share with dad, confirm password works
- Test realtime updates (if enabled)

## Tech Stack Summary

- **Next.js 16** (App Router, TypeScript, Tailwind)
- **Supabase** (PostgreSQL, REST API, optional realtime)
- **Vercel** (deployment, env vars)
- **SWR** (client-side data fetching)
- **shadcn/ui** (component library)

## Success Criteria

✅ Calendar loads and displays 7-day trip
✅ Can add/edit/delete flights, trains, hotels, dinners
✅ Flights/trains/hotels/dinners auto-appear on calendar when date is set
✅ Password protection works
✅ Deployed on Vercel, accessible via public URL
✅ Dad can use it to coordinate

## Time Estimate

**Total: ~4-5 hours of focused work**
- Phase 1: 30 min
- Phase 2: 45 min
- Phase 3: 90 min
- Phase 4: 120 min
- Phase 5: 60 min
