# QoL Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Events management page (edit/delete calendar events) and a Smart Preview Import wizard (bulk import from JSON/CSV into any section).

**Architecture:** Feature 1 adds one db function, one component, and one page following the exact FlightsList pattern. Feature 2 adds a pure `lib/import.ts` mapping module (unit-tested with Vitest), a multi-step `ImportWizard` component, and a page. Both features add a sidebar nav entry via `lib/constants.ts`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase JS client, Tailwind CSS, Vitest (new, for `lib/import.ts` only), papaparse (new, for CSV parsing)

**Spec:** `docs/superpowers/specs/2026-03-19-qol-features-design.md`

---

## File Map

**Feature 1 — Events Management**
- `lib/db.ts` — add `getAllCalendarEvents()` and `updateCalendarEvent()`
- `components/EventsList.tsx` — new, full CRUD list component
- `app/(app)/events/page.tsx` — new, thin page wrapper
- `lib/constants.ts` — add Events to NAV_ITEMS

**Feature 2 — Smart Preview Import**
- `package.json` — add papaparse, @types/papaparse, vitest
- `vitest.config.ts` — minimal Vitest config
- `lib/import.ts` — new, pure parsing + field-mapping logic
- `lib/import.test.ts` — unit tests for lib/import.ts
- `components/ImportWizard.tsx` — new, multi-step wizard
- `app/(app)/import/page.tsx` — new, thin page wrapper
- `lib/constants.ts` — add Import to NAV_ITEMS (same file as Feature 1)

---

## Task 1: Add db functions for calendar events

**Files:**
- Modify: `lib/db.ts`

Context: `createCalendarEvent` and `deleteCalendarEvent` already exist. This task adds the two missing functions. `getAllCalendarEvents` fetches all rows from `calendar_events` (no date filter, unlike the existing `getCalendarEvents` which is a date-filtered aggregate across all tables). `updateCalendarEvent` follows the same pattern as `updateFlight`.

- [ ] **Step 1: Add `getAllCalendarEvents` to `lib/db.ts`**

Open `lib/db.ts` and add after the existing `deleteCalendarEvent` function:

```ts
export async function getAllCalendarEvents() {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return data as CalendarEvent[];
}

export async function updateCalendarEvent(id: string, updates: Partial<CalendarEvent>) {
  const { data, error } = await supabase
    .from("calendar_events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CalendarEvent;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /path/to/provencePlanner
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/db.ts
git commit -m "feat: add getAllCalendarEvents and updateCalendarEvent db functions"
```

---

## Task 2: Build EventsList component

**Files:**
- Create: `components/EventsList.tsx`

Context: Follow the `FlightsList.tsx` pattern exactly — `useState` + `useEffect` to load, a single shared inline form toggled by `showForm` + `editingId`, `handleSubmit` that branches on `editingId`, and `handleDelete` with `confirm()`. The form fields are `date` (`<input type="date">`), `title` (text), and `notes` (textarea, optional).

- [ ] **Step 1: Create `components/EventsList.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import { CalendarEvent } from "@/lib/types";
import {
  getAllCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/db";

export function EventsList() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ date: "", title: "", notes: "" });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setIsLoading(true);
      const data = await getAllCalendarEvents();
      setEvents(data);
    } catch (err) {
      setError("Failed to load events");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCalendarEvent(editingId, {
          date: formData.date,
          title: formData.title,
          notes: formData.notes || null,
        });
        setEditingId(null);
      } else {
        await createCalendarEvent({
          date: formData.date,
          title: formData.title,
          notes: formData.notes || null,
        });
      }
      setFormData({ date: "", title: "", notes: "" });
      setShowForm(false);
      await loadEvents();
    } catch (err) {
      setError("Failed to save event");
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this event?")) {
      try {
        await deleteCalendarEvent(id);
        await loadEvents();
      } catch (err) {
        setError("Failed to delete event");
        console.error(err);
      }
    }
  }

  if (isLoading) {
    return <p style={{ color: "var(--color-cream-300)" }}>Loading events...</p>;
  }

  if (error) {
    return <div style={{ color: "var(--color-terracotta)" }}>{error}</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
          setFormData({ date: "", title: "", notes: "" });
        }}
        className="btn"
      >
        {showForm && !editingId ? "Cancel" : "Add Event"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="form-input"
            />
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="form-input"
            />
            <textarea
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-input sm:col-span-2"
            />
          </div>
          <button type="submit" className="btn">
            {editingId ? "Update Event" : "Save Event"}
          </button>
        </form>
      )}

      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="card">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--color-cream-100)" }}>
                    {event.title}
                  </h3>
                  <p className="font-display italic text-sm" style={{ color: "var(--color-cream-300)" }}>
                    {event.date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(event.id);
                      setFormData({
                        date: event.date,
                        title: event.title,
                        notes: event.notes || "",
                      });
                      setShowForm(true);
                    }}
                    className="btn-secondary"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(event.id)} className="btn-danger">
                    Delete
                  </button>
                </div>
              </div>
              {event.notes && (
                <p className="mt-1 text-sm" style={{ color: "var(--color-cream-500)" }}>
                  {event.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "var(--color-stone-800)" }}>
          <p style={{ color: "var(--color-cream-300)" }}>No events yet</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 3: Wire Events page and add to sidebar

**Files:**
- Create: `app/(app)/events/page.tsx`
- Modify: `lib/constants.ts`

- [ ] **Step 1: Create `app/(app)/events/page.tsx`**

```tsx
import { EventsList } from "@/components/EventsList";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Events</h1>
        <p className="page-subtitle">Manage manual calendar events</p>
      </div>
      <EventsList />
    </div>
  );
}
```

- [ ] **Step 2: Add Events to NAV_ITEMS in `lib/constants.ts`**

Add after the Packing entry:

```ts
{ label: "Events", href: "/events", icon: "📌" },
```

The full `NAV_ITEMS` array should now end with:
```ts
  { label: "Packing", href: "/packing", icon: "🧳" },
  { label: "Events", href: "/events", icon: "📌" },
];
```

- [ ] **Step 3: Manual smoke test**

```bash
npm run dev
```

- Navigate to `/events` — page should load with "No events yet" state
- Click "Add Event", fill in a date and title, click "Save Event" — event appears in the list
- Click "Edit" on an event — form pre-fills with existing data, submit updates the record
- Click "Delete" on an event — confirm dialog appears, event is removed after confirming
- Check "Events" appears in the sidebar nav and highlights when active
- Navigate to `/calendar`, quick-add an event — verify it appears on `/events` page

- [ ] **Step 4: Commit**

```bash
git add app/(app)/events/page.tsx lib/constants.ts components/EventsList.tsx
git commit -m "feat: add Events management page with full CRUD"
```

---

## Task 4: Install papaparse and set up Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

Context: Vitest is added only to test `lib/import.ts` — the pure mapping logic. No component tests are set up. The Vitest config uses `environment: 'node'` since `lib/import.ts` has no DOM dependencies.

- [ ] **Step 1: Install dependencies**

```bash
npm install papaparse
npm install -D @types/papaparse vitest
```

- [ ] **Step 2: Add test scripts to `package.json`**

Add to the `"scripts"` section:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts` at the project root**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 4: Verify Vitest runs with no tests**

```bash
npm test
```

Expected output contains: `No test files found` or `0 tests passed` — no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json vitest.config.ts
git commit -m "chore: add papaparse and vitest"
```

---

## Task 5: Build `lib/import.ts` — core mapping logic (TDD)

**Files:**
- Create: `lib/import.ts`
- Create: `lib/import.test.ts`

Context: `mapFile` takes an array of raw parsed rows (from CSV or JSON) and a section name. It returns `{ mappedRows, unmappedColumns, missingRequired }`. All type coercions (boolean, priority, packed default) happen here. `mappedRows` is always empty when `missingRequired` is non-empty. `id`, `created_at`, `updated_at` are always stripped.

- [ ] **Step 1: Write the failing tests in `lib/import.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { mapFile } from "./import";

describe("mapFile", () => {
  // --- Flights: basic mapping ---

  it("maps exact field names for flights", () => {
    const rows = [
      { airline: "Air France", departure_at: "2026-03-28T10:00", arrival_at: "2026-03-28T14:00", route: "LAX → CDG" },
    ];
    const result = mapFile(rows, "flights");
    expect(result.missingRequired).toEqual([]);
    expect(result.mappedRows).toHaveLength(1);
    expect(result.mappedRows[0].airline).toBe("Air France");
    expect(result.mappedRows[0].route).toBe("LAX → CDG");
  });

  it("maps aliases case-insensitively", () => {
    const rows = [
      { Carrier: "Air France", Departure: "2026-03-28T10:00", Arrival: "2026-03-28T14:00", Route: "LAX → CDG" },
    ];
    const result = mapFile(rows, "flights");
    expect(result.missingRequired).toEqual([]);
    expect(result.mappedRows[0].airline).toBe("Air France");
    expect(result.mappedRows[0].departure_at).toBe("2026-03-28T10:00");
  });

  it("maps aliases with extra whitespace", () => {
    const rows = [
      { "  airline  ": "Air France", departure_at: "2026-03-28T10:00", arrival_at: "2026-03-28T14:00", route: "LAX → CDG" },
    ];
    const result = mapFile(rows, "flights");
    expect(result.mappedRows[0].airline).toBe("Air France");
  });

  it("puts unrecognized columns in unmappedColumns", () => {
    const rows = [
      { airline: "Air France", departure_at: "2026-03-28T10:00", arrival_at: "2026-03-28T14:00", route: "LAX → CDG", weird_extra: "junk" },
    ];
    const result = mapFile(rows, "flights");
    expect(result.unmappedColumns).toContain("weird_extra");
    expect(result.mappedRows[0]).not.toHaveProperty("weird_extra");
  });

  it("returns missingRequired when a required field is absent", () => {
    const rows = [
      { airline: "Air France", departure_at: "2026-03-28T10:00", arrival_at: "2026-03-28T14:00" }, // missing route
    ];
    const result = mapFile(rows, "flights");
    expect(result.missingRequired).toContain("route");
    expect(result.mappedRows).toEqual([]);
  });

  it("returns all missing required fields, not just the first", () => {
    const rows = [{ airline: "Air France" }]; // missing departure_at, arrival_at, route
    const result = mapFile(rows, "flights");
    expect(result.missingRequired).toContain("departure_at");
    expect(result.missingRequired).toContain("arrival_at");
    expect(result.missingRequired).toContain("route");
  });

  // --- Auto-excluded fields ---

  it("strips id, created_at, updated_at from mapped output", () => {
    const rows = [
      {
        id: "some-uuid",
        airline: "Air France",
        departure_at: "2026-03-28T10:00",
        arrival_at: "2026-03-28T14:00",
        route: "LAX → CDG",
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    ];
    const result = mapFile(rows, "flights");
    expect(result.mappedRows[0]).not.toHaveProperty("id");
    expect(result.mappedRows[0]).not.toHaveProperty("created_at");
    expect(result.mappedRows[0]).not.toHaveProperty("updated_at");
  });

  // --- Boolean coercion ---

  it('coerces is_private_chef "yes" to true', () => {
    const rows = [{ date: "2026-03-28", cuisine_or_theme: "BBQ", is_private_chef: "yes" }];
    const result = mapFile(rows, "dinners");
    expect(result.mappedRows[0].is_private_chef).toBe(true);
  });

  it('coerces is_private_chef "no" to false', () => {
    const rows = [{ date: "2026-03-28", cuisine_or_theme: "BBQ", is_private_chef: "no" }];
    const result = mapFile(rows, "dinners");
    expect(result.mappedRows[0].is_private_chef).toBe(false);
  });

  it('coerces is_private_chef "1" to true', () => {
    const rows = [{ date: "2026-03-28", cuisine_or_theme: "BBQ", is_private_chef: "1" }];
    const result = mapFile(rows, "dinners");
    expect(result.mappedRows[0].is_private_chef).toBe(true);
  });

  it('coerces is_private_chef "TRUE" (uppercase) to true', () => {
    const rows = [{ date: "2026-03-28", cuisine_or_theme: "BBQ", is_private_chef: "TRUE" }];
    const result = mapFile(rows, "dinners");
    expect(result.mappedRows[0].is_private_chef).toBe(true);
  });

  // --- Priority coercion ---

  it('keeps valid priority "high"', () => {
    const rows = [{ name: "Pont du Gard", location: "Nîmes", priority: "high" }];
    const result = mapFile(rows, "places");
    expect(result.mappedRows[0].priority).toBe("high");
  });

  it("coerces invalid priority to null", () => {
    const rows = [{ name: "Pont du Gard", location: "Nîmes", priority: "urgent" }];
    const result = mapFile(rows, "places");
    expect(result.mappedRows[0].priority).toBeNull();
  });

  it("coerces empty priority to null", () => {
    const rows = [{ name: "Pont du Gard", location: "Nîmes", priority: "" }];
    const result = mapFile(rows, "places");
    expect(result.mappedRows[0].priority).toBeNull();
  });

  // --- Packing: packed optional-with-default ---

  it("injects packed: false when packed column is absent", () => {
    const rows = [{ item: "Passport", category: "documents" }];
    const result = mapFile(rows, "packing");
    expect(result.missingRequired).toEqual([]);
    expect(result.mappedRows[0].packed).toBe(false);
  });

  it('coerces packed "true" to true when column is present', () => {
    const rows = [{ item: "Passport", category: "documents", packed: "true" }];
    const result = mapFile(rows, "packing");
    expect(result.mappedRows[0].packed).toBe(true);
  });

  // --- Edge cases ---

  it("handles empty rows array", () => {
    const result = mapFile([], "flights");
    expect(result.mappedRows).toEqual([]);
    expect(result.unmappedColumns).toEqual([]);
    expect(result.missingRequired).toEqual([]);
  });

  it("maps multiple rows correctly", () => {
    const rows = [
      { airline: "Air France", departure_at: "2026-03-28T10:00", arrival_at: "2026-03-28T14:00", route: "LAX → CDG" },
      { airline: "EasyJet", departure_at: "2026-04-04T09:00", arrival_at: "2026-04-04T11:00", route: "MRS → LHR" },
    ];
    const result = mapFile(rows, "flights");
    expect(result.mappedRows).toHaveLength(2);
    expect(result.mappedRows[1].airline).toBe("EasyJet");
  });
});
```

- [ ] **Step 2: Run tests — verify they all fail**

```bash
npm test
```

Expected: all tests fail with `Cannot find module './import'`.

- [ ] **Step 3: Create `lib/import.ts` with alias tables and core mapping**

```ts
export type SectionName =
  | "flights"
  | "trains"
  | "hotels"
  | "dinners"
  | "restaurants"
  | "places"
  | "packing"
  | "events";

export type ImportResult = {
  mappedRows: Record<string, unknown>[];
  unmappedColumns: string[];
  missingRequired: string[];
};

type AliasMap = Record<string, string[]>;

const ALIASES: Record<SectionName, AliasMap> = {
  flights: {
    airline:          ["airline", "airline name", "carrier", "operator"],
    departure_at:     ["departure_at", "departure", "depart", "departs", "dep"],
    arrival_at:       ["arrival_at", "arrival", "arrive", "arrives", "arr"],
    route:            ["route", "flight route", "from/to", "leg"],
    confirmation_ref: ["confirmation_ref", "confirmation", "ref", "booking ref", "pnr"],
    notes:            ["notes", "note", "comments", "comment"],
  },
  trains: {
    operator:     ["operator", "train operator", "company", "carrier"],
    departure_at: ["departure_at", "departure", "depart", "departs", "dep"],
    arrival_at:   ["arrival_at", "arrival", "arrive", "arrives", "arr"],
    route:        ["route", "train route", "from/to", "leg", "journey"],
    booking_ref:  ["booking_ref", "booking", "ref", "reservation", "ticket"],
    seat:         ["seat", "seat number", "coach", "carriage"],
    notes:        ["notes", "note", "comments", "comment"],
  },
  hotels: {
    name:             ["name", "hotel name", "property", "accommodation"],
    check_in:         ["check_in", "check in", "checkin", "arrival", "from"],
    check_out:        ["check_out", "check out", "checkout", "departure", "to"],
    location:         ["location", "address", "city", "place"],
    confirmation_ref: ["confirmation_ref", "confirmation", "ref", "booking ref", "reservation"],
    notes:            ["notes", "note", "comments", "comment"],
  },
  dinners: {
    date:             ["date", "dinner date", "day"],
    cuisine_or_theme: ["cuisine_or_theme", "cuisine", "theme", "type", "meal"],
    assigned_cook:    ["assigned_cook", "cook", "chef", "who"],
    is_private_chef:  ["is_private_chef", "private chef", "chef hired", "catered"],
    notes:            ["notes", "note", "comments", "comment"],
  },
  restaurants: {
    name:     ["name", "restaurant name", "restaurant", "place"],
    location: ["location", "address", "city", "area"],
    cuisine:  ["cuisine", "food type", "type", "style"],
    url:      ["url", "link", "website", "booking link"],
    notes:    ["notes", "note", "comments", "comment"],
  },
  places: {
    name:        ["name", "place name", "attraction", "site"],
    description: ["description", "desc", "details", "about"],
    location:    ["location", "address", "city", "area"],
    url:         ["url", "link", "website"],
    priority:    ["priority", "importance", "rank"],
  },
  packing: {
    item:     ["item", "thing", "name", "description"],
    category: ["category", "type", "group", "section"],
    packed:   ["packed", "done", "checked", "complete"],
  },
  events: {
    date:  ["date", "event date", "day", "when"],
    title: ["title", "name", "event", "description"],
    notes: ["notes", "note", "details", "comments"],
  },
};

const REQUIRED: Record<SectionName, string[]> = {
  flights:     ["airline", "departure_at", "arrival_at", "route"],
  trains:      ["operator", "departure_at", "arrival_at", "route"],
  hotels:      ["name", "check_in", "check_out", "location"],
  dinners:     ["date", "cuisine_or_theme", "is_private_chef"],
  restaurants: ["name", "location", "cuisine"],
  places:      ["name", "location"],
  packing:     ["item", "category"], // packed has a default
  events:      ["date", "title"],
};

const AUTO_EXCLUDED = new Set(["id", "created_at", "updated_at"]);

function toBoolean(value: unknown): boolean {
  return ["true", "yes", "1"].includes(String(value).toLowerCase().trim());
}

function toPriority(value: unknown): "low" | "medium" | "high" | null {
  const s = String(value).toLowerCase().trim();
  if (s === "low" || s === "medium" || s === "high") return s;
  return null;
}

function resolveColumn(col: string, aliases: AliasMap): string | null {
  const normalized = col.toLowerCase().trim();
  for (const [canonical, aliasList] of Object.entries(aliases)) {
    if (aliasList.map((a) => a.toLowerCase().trim()).includes(normalized)) {
      return canonical;
    }
  }
  return null;
}

export function mapFile(
  rawRows: Record<string, unknown>[],
  section: SectionName
): ImportResult {
  if (rawRows.length === 0) {
    return { mappedRows: [], unmappedColumns: [], missingRequired: [] };
  }

  const aliases = ALIASES[section];
  const required = REQUIRED[section];

  const sourceColumns = Object.keys(rawRows[0]).filter(
    (col) => !AUTO_EXCLUDED.has(col.toLowerCase().trim())
  );

  const columnToCanonical: Record<string, string> = {};
  const unmappedColumns: string[] = [];

  for (const col of sourceColumns) {
    const canonical = resolveColumn(col, aliases);
    if (canonical) {
      columnToCanonical[col] = canonical;
    } else {
      unmappedColumns.push(col);
    }
  }

  const mappedCanonicals = new Set(Object.values(columnToCanonical));
  const missingRequired = required.filter((f) => !mappedCanonicals.has(f));

  if (missingRequired.length > 0) {
    return { mappedRows: [], unmappedColumns, missingRequired };
  }

  const mappedRows = rawRows.map((row) => {
    const out: Record<string, unknown> = {};

    for (const [col, canonical] of Object.entries(columnToCanonical)) {
      let value = row[col];

      if (
        (section === "dinners" && canonical === "is_private_chef") ||
        (section === "packing" && canonical === "packed")
      ) {
        value = toBoolean(value);
      }

      if (section === "places" && canonical === "priority") {
        value = toPriority(value);
      }

      out[canonical] = value;
    }

    if (section === "packing" && !mappedCanonicals.has("packed")) {
      out.packed = false;
    }

    return out;
  });

  return { mappedRows, unmappedColumns, missingRequired: [] };
}
```

- [ ] **Step 4: Run tests — verify they all pass**

```bash
npm test
```

Expected: all tests pass. If any fail, fix `lib/import.ts` before proceeding.

- [ ] **Step 5: Commit**

```bash
git add lib/import.ts lib/import.test.ts
git commit -m "feat: add lib/import.ts with field mapping and unit tests"
```

---

## Task 6: Build ImportWizard component

**Files:**
- Create: `components/ImportWizard.tsx`

Context: A client component with a 3-step state machine (`upload` → `preview` → `result`). Section select sits above the steps and resets to `upload` on change. File parsing happens in the `handleFileUpload` handler using papaparse (CSV) or a small inline JSON parser. The Supabase insert uses `TABLE_NAMES` to map section name to the correct table (`events` → `calendar_events`).

- [ ] **Step 1: Create `components/ImportWizard.tsx`**

```tsx
"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { mapFile, SectionName, ImportResult } from "@/lib/import";
import { supabase } from "@/lib/supabase";

type Step = "upload" | "preview" | "result";

const SECTION_OPTIONS: { value: SectionName; label: string }[] = [
  { value: "flights", label: "Flights" },
  { value: "trains", label: "Trains" },
  { value: "hotels", label: "Hotels" },
  { value: "dinners", label: "Dinners" },
  { value: "restaurants", label: "Restaurants" },
  { value: "places", label: "Places" },
  { value: "packing", label: "Packing" },
  { value: "events", label: "Events" },
];

const TABLE_NAMES: Record<SectionName, string> = {
  flights: "flights",
  trains: "trains",
  hotels: "hotels",
  dinners: "dinners",
  restaurants: "restaurants",
  places: "places",
  packing: "packing",
  events: "calendar_events",
};

function parseJSON(text: string): Record<string, unknown>[] | null {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as Record<string, unknown>[];
    if (typeof parsed === "object" && parsed !== null) {
      const arrays = Object.values(parsed).filter(Array.isArray) as Record<
        string,
        unknown
      >[][];
      if (arrays.length === 0) return null;
      return arrays.reduce((a, b) => (b.length > a.length ? b : a));
    }
    return null;
  } catch {
    return null;
  }
}

export function ImportWizard() {
  const [section, setSection] = useState<SectionName>("flights");
  const [step, setStep] = useState<Step>("upload");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importCount, setImportCount] = useState<number | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSectionChange(newSection: SectionName) {
    setSection(newSection);
    setStep("upload");
    setImportResult(null);
    setParseError(null);
    setImportCount(null);
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);

    const text = await file.text();
    let rawRows: Record<string, unknown>[] | null = null;

    if (file.name.endsWith(".csv")) {
      const parsed = Papa.parse<Record<string, unknown>>(text, {
        header: true,
        skipEmptyLines: true,
      });
      rawRows = parsed.data;
    } else if (file.name.endsWith(".json")) {
      rawRows = parseJSON(text);
    } else {
      setParseError("Unsupported file type. Upload a .json or .csv file.");
      return;
    }

    if (!rawRows || rawRows.length === 0) {
      setParseError("Could not parse file or file is empty.");
      return;
    }

    const result = mapFile(rawRows, section);
    setImportResult(result);

    if (result.missingRequired.length > 0) {
      const fields = result.missingRequired.map((f) => `\`${f}\``).join(", ");
      const plural = result.missingRequired.length > 1;
      setParseError(
        `Required field${plural ? "s" : ""} could not be mapped: ${fields}. Rename the column${plural ? "s" : ""} in your file and re-upload.`
      );
      return;
    }

    setStep("preview");
  }

  async function handleConfirm() {
    if (!importResult) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES[section])
        .insert(importResult.mappedRows)
        .select();
      if (error) throw error;
      setImportCount(data.length);
      setStep("result");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  }

  function handleReset() {
    setStep("upload");
    setImportResult(null);
    setParseError(null);
    setImportCount(null);
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const previewRows = importResult?.mappedRows.slice(0, 10) ?? [];
  const previewColumns = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

  return (
    <div className="space-y-6">
      {/* Section select — always visible */}
      <div className="card space-y-2">
        <label className="section-label block">Import into</label>
        <select
          value={section}
          onChange={(e) => handleSectionChange(e.target.value as SectionName)}
          className="form-input"
        >
          {SECTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Step: upload */}
      {step === "upload" && (
        <div className="card space-y-4">
          <p className="text-sm" style={{ color: "var(--color-cream-300)" }}>
            Upload a <code>.json</code> or <code>.csv</code> file. Column names
            will be auto-mapped to {section} fields.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileUpload}
            className="form-input"
          />
          {parseError && (
            <p className="text-sm" style={{ color: "var(--color-terracotta)" }}>
              {parseError}
            </p>
          )}
        </div>
      )}

      {/* Step: preview */}
      {step === "preview" && importResult && (
        <div className="space-y-4">
          <div className="card space-y-4">
            <p className="text-sm" style={{ color: "var(--color-cream-300)" }}>
              Previewing first {previewRows.length} of{" "}
              {importResult.mappedRows.length} rows.
            </p>

            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ color: "var(--color-cream-200)" }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--color-stone-700)",
                    }}
                  >
                    {previewColumns.map((col) => (
                      <th
                        key={col}
                        className="px-2 py-1 text-left font-medium"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid var(--color-stone-800)",
                      }}
                    >
                      {previewColumns.map((col) => (
                        <td key={col} className="px-2 py-1">
                          {String(row[col] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {importResult.unmappedColumns.length > 0 && (
              <div>
                <p className="section-label mb-1 text-xs">Ignored columns</p>
                <div className="flex flex-wrap gap-1">
                  {importResult.unmappedColumns.map((col) => (
                    <span
                      key={col}
                      className="rounded px-1.5 py-0.5 text-xs"
                      style={{
                        backgroundColor: "var(--color-stone-800)",
                        color: "var(--color-cream-500)",
                      }}
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {importError && (
            <p className="text-sm" style={{ color: "var(--color-terracotta)" }}>
              {importError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={isImporting}
              className="btn"
            >
              {isImporting
                ? "Importing…"
                : `Import ${importResult.mappedRows.length} rows`}
            </button>
            <button onClick={handleReset} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step: result */}
      {step === "result" && (
        <div className="card space-y-4">
          <p className="font-semibold" style={{ color: "var(--color-cream-100)" }}>
            ✓ Imported {importCount} {section} successfully.
          </p>
          <button onClick={handleReset} className="btn-secondary">
            Import another file
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 7: Wire Import page and add to sidebar

**Files:**
- Create: `app/(app)/import/page.tsx`
- Modify: `lib/constants.ts`

- [ ] **Step 1: Create `app/(app)/import/page.tsx`**

```tsx
import { ImportWizard } from "@/components/ImportWizard";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Import</h1>
        <p className="page-subtitle">
          Bulk import trip data from a JSON or CSV file
        </p>
      </div>
      <ImportWizard />
    </div>
  );
}
```

- [ ] **Step 2: Add Import to NAV_ITEMS in `lib/constants.ts`**

Add after the Events entry added in Task 3:

```ts
{ label: "Import", href: "/import", icon: "📥" },
```

The final `NAV_ITEMS` array should end with:
```ts
  { label: "Events", href: "/events", icon: "📌" },
  { label: "Import", href: "/import", icon: "📥" },
];
```

- [ ] **Step 3: Manual smoke test**

```bash
npm run dev
```

**CSV test:** create a file `test-flights.csv`:
```
airline,departure,arrival,route,confirmation
Air France,2026-03-28T10:00,2026-03-28T14:00,LAX → CDG,AF123
EasyJet,2026-04-04T09:00,2026-04-04T11:00,MRS → LHR,EZ456
```

- Navigate to `/import`
- Select "Flights" from the dropdown
- Upload `test-flights.csv`
- Verify the preview table appears with 2 rows and columns `airline`, `departure_at`, `arrival_at`, `route`, `confirmation_ref`
- Click "Import 2 rows"
- Verify success message appears
- Navigate to `/flights` — verify the two imported flights appear

**Missing field test:** create `test-bad.csv`:
```
carrier,route
Air France,LAX → CDG
```
- Upload to Flights — verify error message listing `departure_at` and `arrival_at` as unmapped required fields; preview should NOT appear

**JSON test:** create `test-places.json`:
```json
[
  { "name": "Pont du Gard", "location": "Nîmes", "priority": "high" },
  { "name": "Les Baux-de-Provence", "location": "Les Baux", "priority": "medium" }
]
```
- Select "Places", upload `test-places.json`
- Verify preview shows 2 rows with `name`, `location`, `priority`
- Import and check `/places`

**Section reset test:**
- Upload a file, advance to preview
- Change the dropdown to a different section
- Verify the wizard resets to the upload step

- [ ] **Step 4: Run full test suite one final time**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Final commit**

```bash
git add app/(app)/import/page.tsx lib/constants.ts components/ImportWizard.tsx
git commit -m "feat: add Import page with smart CSV/JSON preview wizard"
```

---

## Verification Checklist

Before calling this done, confirm:

- [ ] `/events` — add, edit, delete all work; events appear on calendar
- [ ] `/calendar` quick-add still works; created events visible on `/events`
- [ ] `/import` — CSV and JSON both parse; required-field error shown for bad files; successful import inserts rows into correct Supabase table
- [ ] Both pages appear in the sidebar and highlight correctly when active
- [ ] `npm test` passes with no failures
- [ ] `npx tsc --noEmit` passes with no errors
