export interface Flight {
  id: string;
  airline: string;
  departure_at: string;
  arrival_at: string;
  route: string;
  confirmation_ref: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Train {
  id: string;
  operator: string;
  departure_at: string;
  arrival_at: string;
  route: string;
  booking_ref: string | null;
  seat: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Hotel {
  id: string;
  name: string;
  check_in: string;
  check_out: string;
  location: string;
  confirmation_ref: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Dinner {
  id: string;
  date: string;
  cuisine_or_theme: string;
  assigned_cook: string | null;
  notes: string | null;
  is_private_chef: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  url: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Place {
  id: string;
  name: string;
  description: string | null;
  location: string;
  url: string | null;
  priority: "low" | "medium" | "high" | null;
  created_at?: string;
  updated_at?: string;
}

export interface PackingItem {
  id: string;
  item: string;
  category: string;
  packed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CalendarItem = {
  id: string;
  date: string;
  title: string;
  type: "flight" | "train" | "hotel" | "dinner" | "event";
  color: string;
  data?: Flight | Train | Hotel | Dinner | CalendarEvent;
};
