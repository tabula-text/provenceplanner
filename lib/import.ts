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
    description: ["description", "desc", "details", "detail", "about"],
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
  packing:     ["item", "category"],
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
