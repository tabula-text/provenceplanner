# QoL Features Design — Provence Planner

**Date:** 2026-03-19
**Status:** Approved
**Scope:** Two features — Events Management page, Smart Preview Import

---

## Context

The Provence Planner is a Next.js 16 App Router trip planning app for a Southern France vacation (March 16 – April 20, 2026). It has a calendar as the hero feature, aggregating flights, trains, hotels, dinners, and manual calendar events from Supabase. All sections have full CRUD except:

1. **Calendar events** — can be quick-added from the calendar but cannot be edited or deleted
2. **No data import** — trip data must be entered manually one record at a time

### Existing db functions (relevant)
- `createCalendarEvent(event)` — already exists
- `deleteCalendarEvent(id)` — already exists

---

## Feature 1: Events Management Page

### Problem

`calendar_events` is a write-only surface. The quick-add form on the calendar creates events but there is no way to edit or delete them. The rest of the app (flights, trains, hotels, dinners) all have dedicated management pages — events should too.

### Solution

Add a dedicated `/events` page following the exact same pattern as `FlightsList.tsx`.

### Files Changed

| File | Change |
|------|--------|
| `lib/db.ts` | Add `getAllCalendarEvents()` (no date filter, `calendar_events` table only) and `updateCalendarEvent(id, updates)` — `createCalendarEvent` and `deleteCalendarEvent` already exist |
| `components/EventsList.tsx` | New component — calls `getAllCalendarEvents`, `createCalendarEvent`, `updateCalendarEvent`, `deleteCalendarEvent` |
| `app/(app)/events/page.tsx` | New page wrapping `EventsList` |
| `lib/constants.ts` | Add `{ href: '/events', label: 'Events', icon: '📌' }` to `NAV_ITEMS` |

### Schema

No schema changes. `calendar_events` table: `id` (uuid, auto), `date` (YYYY-MM-DD string), `title` (string), `notes` (string|null), `created_at` (auto), `updated_at` (auto).

Required fields: `date`, `title`. Optional: `notes`.

### Behaviour

- Lists all `calendar_events` rows sorted by date ascending
- "Add Event" button → inline form with fields: `date` (`<input type="date">`), `title` (text), `notes` (textarea, optional)
- Each row has Edit and Delete buttons
- **Single shared form instance** (same pattern as `FlightsList`): one `showForm` boolean + one `editingId` state. Clicking "Add Event" clears `editingId` and shows the blank form. Clicking "Edit" on a row sets `editingId` to that row's id and pre-fills the form fields. Clicking either while the form is already open replaces the current form state (no second form instance is ever rendered).
- Delete shows `confirm()` dialog before removing
- Calendar page is unchanged — quick-add still works, events still show as chips
- To delete or edit a calendar event, user navigates to the Events page

---

## Feature 2: Smart Preview Import

### Problem

A collaborator has prepared trip data in an external tool. The format will be JSON or CSV. Re-entering everything manually is error-prone. Both formats must be supported.

### Solution

A multi-step import wizard: upload → auto-map fields → preview → confirm → bulk insert.

### Dependencies

Add `papaparse` (and `@types/papaparse`) for CSV parsing. Do not hand-roll a CSV parser — quoted fields and embedded commas will break a naive implementation.

### Files Changed

| File | Change |
|------|--------|
| `lib/import.ts` | New — pure parsing + field-mapping logic (no UI, no side effects) |
| `components/ImportWizard.tsx` | New — multi-step wizard component |
| `app/(app)/import/page.tsx` | New page wrapping `ImportWizard` |
| `lib/constants.ts` | Add `{ href: '/import', label: 'Import', icon: '📥' }` to `NAV_ITEMS` |

### Import Flow

1. **Section select** — dropdown to choose target table (Flights, Trains, Hotels, Dinners, Restaurants, Places, Packing, Events); changing the section at any point resets the wizard back to Step 2 (file upload), discarding any parsed/mapped state
2. **File upload** — accepts `.json` or `.csv`
3. **Parse** — client-side:
   - **CSV**: use `papaparse` with `header: true`; first row = field names
   - **JSON**: if top-level value is an array, use it directly; if top-level is an object, pick the first key whose value is an array; if multiple array-valued keys exist, pick the one with the most elements
4. **Field mapping** — `lib/import.ts` fuzzy-matches source column names to target schema fields using the alias tables defined below; matching is case-insensitive with whitespace trimmed; auto-generated fields (`id`, `created_at`, `updated_at`) are always excluded from mapped output even if present in the source file
5. **Validation** — before showing the preview, check that all required fields for the selected section are mapped; if any required field is unmapped, show an error ("Required field `X` could not be mapped — rename the column in your file and re-upload") and do not proceed to preview
6. **Preview** — table showing first 10 rows with mapped fields as column headers; unmapped/excluded source columns shown greyed-out in a separate "Ignored columns" list below the table
7. **Confirm** — "Import N rows" button; bulk insert via Supabase `.insert([...rows])`; `id`, `created_at`, `updated_at` stripped from every row before insert
8. **Result** — success count shown; any per-row Supabase errors surfaced inline

---

## Schemas and Field Alias Tables

### Flights
Required: `airline`, `departure_at`, `arrival_at`, `route` | Optional: `confirmation_ref`, `notes`

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

### Trains
Required: `operator`, `departure_at`, `arrival_at`, `route` | Optional: `booking_ref`, `seat`, `notes`

```ts
const TRAIN_ALIASES = {
  operator:    ["operator", "train operator", "company", "carrier"],
  departure_at:["departure_at", "departure", "depart", "departs", "dep"],
  arrival_at:  ["arrival_at", "arrival", "arrive", "arrives", "arr"],
  route:       ["route", "train route", "from/to", "leg", "journey"],
  booking_ref: ["booking_ref", "booking", "ref", "reservation", "ticket"],
  seat:        ["seat", "seat number", "coach", "carriage"],
  notes:       ["notes", "note", "comments", "comment"],
};
```

### Hotels
Required: `name`, `check_in`, `check_out`, `location` | Optional: `confirmation_ref`, `notes`

```ts
const HOTEL_ALIASES = {
  name:             ["name", "hotel name", "property", "accommodation"],
  check_in:         ["check_in", "check in", "checkin", "arrival", "from"],
  check_out:        ["check_out", "check out", "checkout", "departure", "to"],
  location:         ["location", "address", "city", "place"],
  confirmation_ref: ["confirmation_ref", "confirmation", "ref", "booking ref", "reservation"],
  notes:            ["notes", "note", "comments", "comment"],
};
```

### Dinners
Required: `date`, `cuisine_or_theme`, `is_private_chef` | Optional: `assigned_cook`, `notes`
Note: `is_private_chef` is a boolean. Boolean coercion for all boolean fields happens inside `lib/import.ts` (the mapping layer, not the wizard). Coercion rules: `"true"`, `"yes"`, `"1"` → `true`; `"false"`, `"no"`, `"0"`, empty string → `false`. Matching is case-insensitive.

```ts
const DINNER_ALIASES = {
  date:             ["date", "dinner date", "day"],
  cuisine_or_theme: ["cuisine_or_theme", "cuisine", "theme", "type", "meal"],
  assigned_cook:    ["assigned_cook", "cook", "chef", "who"],
  is_private_chef:  ["is_private_chef", "private chef", "chef hired", "catered"],
  notes:            ["notes", "note", "comments", "comment"],
};
```

### Restaurants
Required: `name`, `location`, `cuisine` | Optional: `url`, `notes`

```ts
const RESTAURANT_ALIASES = {
  name:     ["name", "restaurant name", "restaurant", "place"],
  location: ["location", "address", "city", "area"],
  cuisine:  ["cuisine", "food type", "type", "style"],
  url:      ["url", "link", "website", "booking link"],
  notes:    ["notes", "note", "comments", "comment"],
};
```

### Places
Required: `name`, `location` | Optional: `description`, `url`, `priority`
Note: `priority` coercion happens inside `lib/import.ts`. Values `"low"`, `"medium"`, `"high"` (case-insensitive) are kept as-is; any other value (including empty string) maps to `null`.

```ts
const PLACE_ALIASES = {
  name:        ["name", "place name", "attraction", "site"],
  description: ["description", "desc", "details", "about"],
  location:    ["location", "address", "city", "area"],
  url:         ["url", "link", "website"],
  priority:    ["priority", "importance", "rank"],
};
```

### Packing
Required: `item`, `category` | Optional with default: `packed` (defaults to `false` if column is absent or unmapped)
Note: `packed` uses the same boolean coercion as `is_private_chef`, applied in `lib/import.ts`. Because it has a default, a missing `packed` column does not trigger required-field validation — `lib/import.ts` injects `packed: false` for every row when the column is unmapped.

```ts
const PACKING_ALIASES = {
  item:     ["item", "thing", "name", "description"],
  category: ["category", "type", "group", "section"],
  packed:   ["packed", "done", "checked", "complete"],
};
```

### Events (calendar_events)
Required: `date`, `title` | Optional: `notes`

```ts
const EVENT_ALIASES = {
  date:  ["date", "event date", "day", "when"],
  title: ["title", "name", "event", "description"],
  notes: ["notes", "note", "details", "comments"],
};
```

---

## Architecture Notes

**`lib/import.ts` return contract:**
```ts
type ImportResult = {
  mappedRows: Record<string, unknown>[];  // empty array if missingRequired is non-empty
  unmappedColumns: string[];              // source columns that matched no alias
  missingRequired: string[];             // canonical field names that are required but unmapped
};
```
`mappedRows` is always an empty array when `missingRequired.length > 0`. The wizard gates on `missingRequired.length === 0` before rendering the preview. `lib/import.ts` also handles: boolean coercion for `is_private_chef` and `packed`, `priority` enum coercion for Places, `packed` default injection for Packing, and stripping of `id`/`created_at`/`updated_at`.

- All Supabase inserts follow the existing client pattern (no API routes)
- Section change resets wizard to Step 2 (file upload), not Step 1

---

## Success Criteria

- [ ] Events page lists all manual calendar events sorted by date
- [ ] Events can be added, edited, and deleted from the Events page
- [ ] Calendar quick-add still works unchanged
- [ ] Import page accepts `.json` and `.csv` files
- [ ] Field mapping auto-detects column name variations using alias tables
- [ ] Required-field validation blocks the preview if a required field is unmapped
- [ ] Preview shows first 10 rows before committing
- [ ] Unmapped columns are shown greyed-out below the preview table
- [ ] Bulk insert works for all 8 section types
- [ ] `id`, `created_at`, `updated_at` are never inserted (stripped automatically)
- [ ] Changing section after upload resets the wizard
