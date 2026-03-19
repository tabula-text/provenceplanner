# QoL Features Design — Provence Planner

**Date:** 2026-03-19
**Status:** Approved
**Scope:** Two features — Events Management page, Smart Preview Import

---

## Context

The Provence Planner is a Next.js 16 App Router trip planning app for a Southern France vacation (March 16 – April 20, 2026). It has a calendar as the hero feature, aggregating flights, trains, hotels, dinners, and manual calendar events from Supabase. All sections have full CRUD except:

1. **Calendar events** — can be quick-added from the calendar but cannot be edited or deleted
2. **No data import** — trip data must be entered manually one record at a time

---

## Feature 1: Events Management Page

### Problem

`calendar_events` is a write-only surface. The quick-add form on the calendar creates events but there is no way to edit or delete them. The rest of the app (flights, trains, hotels, dinners) all have dedicated management pages — events should too.

### Solution

Add a dedicated `/events` page following the exact same pattern as `FlightsList.tsx`.

### Files Changed

| File | Change |
|------|--------|
| `lib/db.ts` | Add `updateCalendarEvent(id, updates)` |
| `components/EventsList.tsx` | New component — list, add, edit, delete |
| `app/(app)/events/page.tsx` | New page wrapping `EventsList` |
| `lib/constants.ts` | Add `{ href: '/events', label: 'Events', icon: '📌' }` to `NAV_ITEMS` |

### Behaviour

- Lists all `calendar_events` rows sorted by date
- "Add Event" button → inline form with fields: date, title, notes (optional)
- Each row has Edit and Delete buttons
- Edit pre-fills the inline form (same pattern as `FlightsList`)
- Delete shows `confirm()` dialog before removing
- Calendar page is unchanged — quick-add still works, events still show as chips
- To delete a calendar event, user navigates to the Events page

### Data

No schema changes. `calendar_events` table already has: `id`, `date`, `title`, `notes`, `created_at`, `updated_at`.
Only missing db function is `updateCalendarEvent`.

---

## Feature 2: Smart Preview Import

### Problem

A collaborator (dad) has already prepared trip data in an external tool. Re-entering everything manually is error-prone and time-consuming. The format is unknown — could be JSON or CSV.

### Solution

A multi-step import wizard: upload → auto-map fields → preview → confirm → bulk insert.

### Files Changed

| File | Change |
|------|--------|
| `lib/import.ts` | New — pure parsing + field-mapping logic (no UI, no side effects) |
| `components/ImportWizard.tsx` | New — multi-step wizard component |
| `app/(app)/import/page.tsx` | New page wrapping `ImportWizard` |
| `lib/constants.ts` | Add `{ href: '/import', label: 'Import', icon: '📥' }` to `NAV_ITEMS` |

### Import Flow

1. **Section select** — dropdown to choose target table (Flights, Trains, Hotels, Dinners, Restaurants, Places, Packing, Events)
2. **File upload** — accepts `.json` or `.csv`
3. **Parse** — client-side; JSON expects top-level array `[{...}]` or auto-detects an object key containing an array; CSV uses first row as headers
4. **Field mapping** — `lib/import.ts` fuzzy-matches source column names to target schema fields (case-insensitive, strip spaces, check common aliases e.g. `"departure"` → `departure_at`, `"check in"` → `check_in`, `"airline name"` → `airline`)
5. **Preview** — table showing first 10 rows; mapped fields shown as column headers; unmapped columns greyed out and skipped
6. **Confirm** — "Import N rows" button; bulk insert via Supabase `.insert([...rows])`
7. **Result** — success count shown; errors surfaced per-row if any fail

### Field Mapping (`lib/import.ts`)

Each target schema has a mapping definition: an object where keys are canonical field names and values are arrays of accepted aliases. Example for flights:

```ts
const FLIGHT_ALIASES = {
  airline:          ["airline", "airline name", "carrier", "operator"],
  departure_at:     ["departure_at", "departure", "depart", "departs", "dep"],
  arrival_at:       ["arrival_at", "arrival", "arrive", "arrives", "arr"],
  route:            ["route", "flight route", "from/to", "leg"],
  confirmation_ref: ["confirmation_ref", "confirmation", "ref", "booking ref", "pnr"],
  notes:            ["notes", "note", "comments", "comment"],
};
```

Matching is: lowercase, trim whitespace, compare against aliases. Returns mapped rows (with canonical keys) and a list of unmapped source columns (for display in preview).

### No API Route Needed

Supabase inserts happen directly from the client via the existing pattern. No new API routes required.

---

## Architecture Notes

- Both features follow existing conventions: same component pattern as `FlightsList`, same Supabase client pattern as `lib/db.ts`
- `lib/import.ts` is pure (no Supabase calls, no React) so it can be unit tested independently
- No new dependencies needed — CSV parsing can be done with a small hand-rolled parser or `papaparse` (already a common transitive dep to check)
- Both new pages slot into the existing sidebar via `NAV_ITEMS` in `lib/constants.ts`

---

## Success Criteria

- [ ] Events page lists all manual calendar events
- [ ] Events can be added, edited, and deleted from the Events page
- [ ] Calendar quick-add still works unchanged
- [ ] Import page accepts `.json` and `.csv` files
- [ ] Field mapping auto-detects common column name variations
- [ ] Preview shows first 10 rows before committing
- [ ] Bulk insert works for all 8 section types
- [ ] Unmapped columns are clearly indicated in the preview
