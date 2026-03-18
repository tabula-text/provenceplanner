// Trip dates
export const TRIP_START = "2024-05-15";
export const TRIP_END = "2024-05-22";

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
];
