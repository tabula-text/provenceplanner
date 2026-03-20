// Trip dates — full window (arrivals through departures)
export const TRIP_START = "2026-03-16";
export const TRIP_END = "2026-04-20";

// Villa dates — family convenes near St. Rémy-en-Provence
export const VILLA_START = "2026-03-28";
export const VILLA_END = "2026-04-04";

// Trip password (from env, but with a fallback for development)
export const TRIP_PASSWORD = process.env.NEXT_PUBLIC_TRIP_PASSWORD || "provence2024";

// Event colors
export const EVENT_COLORS = {
  flight: "bg-blue-500",
  train: "bg-orange-500",
  hotel: "bg-green-500",
  dinner: "bg-red-500",
  event: "bg-purple-500",
};

// Navigation items
export const NAV_ITEMS = [
  { label: "Calendar", href: "/calendar", icon: "📅" },
  { label: "Flights", href: "/flights", icon: "✈️" },
  { label: "Trains", href: "/trains", icon: "🚂" },
  { label: "Hotels", href: "/hotels", icon: "🏨" },
  { label: "Dinners", href: "/dinners", icon: "🍽️" },
  { label: "Restaurants", href: "/restaurants", icon: "🍴" },
  { label: "Places", href: "/places", icon: "🗺️" },
  { label: "Packing", href: "/packing", icon: "🧳" },
  { label: "Events", href: "/events", icon: "📌" },
  { label: "Import", href: "/import", icon: "📥" },
];
