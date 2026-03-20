# Páskaferðin 2026 — Data Files

**Last updated:** 20 March 2026

These files contain all current trip data for the France trip (26 March – 8 April 2026), structured for building a website or app.

## Files

### `trip-data.json`
The main data file. Everything your site needs in one JSON object.

**Structure:**

| Key | What's in it |
|-----|-------------|
| `meta` | Trip title, dates, group size, locations |
| `people` | All 14 travellers — names, DOB, kennitala, phone, email, passport names, trip dates, group assignments |
| `accommodation` | 3 places: Mas des Joubarbes (house), La Maison du Village (hotel, 2 nights), Fontaines du Luxembourg (Paris hotel) |
| `transport.flights` | 4 flights (2 Delta for Hjalti & Vera, 2 TBD for main group) |
| `transport.trains` | 3 trains (4S24ZM, 7FQ3AX, Kalli's Apr 4 train) |
| `transport.cars` | 2 cars (Alamo Volvo XC60, Kalli's electric car) |
| `schedule` | Day-by-day from Mar 26 → Apr 5, each with time blocks. Bilingual IS/EN throughout. |
| `activities` | 4 activities: birthday dinner, cooking class, tennis, bikes — with contact details and status |
| `practical` | Restaurant recommendations (12), grocery stores (5), places to see (12), golf (2), weekly markets (2) |
| `contacts` | Key contacts: Anne Marin (property), Yvan Gilardi (chef), Kevin (tennis), Pierre (bikes) |
| `missing` | Everything still unconfirmed or missing — useful for a "needs attention" banner |

**Notes for the developer:**
- All text that needs to appear in both languages uses `{ "is": "...", "en": "..." }` objects
- `null` values mean "not yet known" — treat them as gaps to display
- Status values: `"confirmed"`, `"unconfirmed"`, `"missing"`, `"tentative"`
- The `missing` array at the bottom is a checklist of open items — great for building a status dashboard
- Dates are ISO format (`2026-03-28`), times are 24h format (`"19:30"`)

## Data sources

This data was compiled from:
- The current trip website HTML (`Claude web page v2.html`)
- Notion databases (Hópurinn + Ferðir & Dagskrá)
- Anne Marin's emails (18 Mar: stay info, 17 Mar: tennis & bikes, 16 Mar: initial tennis/bike response)
- Booking confirmations in Gmail
