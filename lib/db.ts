import { supabase } from "./supabase";
import {
  Flight,
  Train,
  Hotel,
  Dinner,
  Restaurant,
  Place,
  PackingItem,
  CalendarEvent,
  CalendarItem,
} from "./types";

// Calendar Events - aggregate from all event types
export async function getCalendarEvents(
  startDate: string,
  endDate: string
): Promise<CalendarItem[]> {
  const items: CalendarItem[] = [];

  // Get flights
  const { data: flights } = await supabase
    .from("flights")
    .select("*")
    .gte("departure_at", startDate)
    .lte("arrival_at", endDate);

  if (flights) {
    flights.forEach((flight: Flight) => {
      items.push({
        id: flight.id,
        date: flight.departure_at.split("T")[0],
        title: `✈️ ${flight.airline} - ${flight.route}`,
        type: "flight",
        color: "bg-blue-500",
        data: flight,
      });
    });
  }

  // Get trains
  const { data: trains } = await supabase
    .from("trains")
    .select("*")
    .gte("departure_at", startDate)
    .lte("arrival_at", endDate);

  if (trains) {
    trains.forEach((train: Train) => {
      items.push({
        id: train.id,
        date: train.departure_at.split("T")[0],
        title: `🚂 ${train.operator} - ${train.route}`,
        type: "train",
        color: "bg-orange-500",
        data: train,
      });
    });
  }

  // Get hotels
  const { data: hotels } = await supabase
    .from("hotels")
    .select("*")
    .gte("check_in", startDate)
    .lte("check_out", endDate);

  if (hotels) {
    hotels.forEach((hotel: Hotel) => {
      items.push({
        id: hotel.id,
        date: hotel.check_in,
        title: `🏨 ${hotel.name}`,
        type: "hotel",
        color: "bg-green-500",
        data: hotel,
      });
    });
  }

  // Get dinners
  const { data: dinners } = await supabase
    .from("dinners")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate);

  if (dinners) {
    dinners.forEach((dinner: Dinner) => {
      items.push({
        id: dinner.id,
        date: dinner.date,
        title: `🍽️ ${dinner.cuisine_or_theme}`,
        type: "dinner",
        color: "bg-red-500",
        data: dinner,
      });
    });
  }

  // Get manual calendar events
  const { data: events } = await supabase
    .from("calendar_events")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate);

  if (events) {
    events.forEach((event: CalendarEvent) => {
      items.push({
        id: event.id,
        date: event.date,
        title: `📌 ${event.title}`,
        type: "event",
        color: "bg-purple-500",
        data: event,
      });
    });
  }

  // Sort by date
  return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Flights
export async function getFlights() {
  const { data, error } = await supabase.from("flights").select("*");
  if (error) throw error;
  return data as Flight[];
}

export async function getFlightById(id: string) {
  const { data, error } = await supabase
    .from("flights")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Flight;
}

export async function createFlight(flight: Omit<Flight, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("flights")
    .insert([flight])
    .select()
    .single();
  if (error) throw error;
  return data as Flight;
}

export async function updateFlight(id: string, updates: Partial<Flight>) {
  const { data, error } = await supabase
    .from("flights")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Flight;
}

export async function deleteFlight(id: string) {
  const { error } = await supabase.from("flights").delete().eq("id", id);
  if (error) throw error;
}

// Trains
export async function getTrains() {
  const { data, error } = await supabase.from("trains").select("*");
  if (error) throw error;
  return data as Train[];
}

export async function getTrainById(id: string) {
  const { data, error } = await supabase
    .from("trains")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Train;
}

export async function createTrain(train: Omit<Train, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("trains")
    .insert([train])
    .select()
    .single();
  if (error) throw error;
  return data as Train;
}

export async function updateTrain(id: string, updates: Partial<Train>) {
  const { data, error } = await supabase
    .from("trains")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Train;
}

export async function deleteTrain(id: string) {
  const { error } = await supabase.from("trains").delete().eq("id", id);
  if (error) throw error;
}

// Hotels
export async function getHotels() {
  const { data, error } = await supabase.from("hotels").select("*");
  if (error) throw error;
  return data as Hotel[];
}

export async function getHotelById(id: string) {
  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Hotel;
}

export async function createHotel(hotel: Omit<Hotel, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("hotels")
    .insert([hotel])
    .select()
    .single();
  if (error) throw error;
  return data as Hotel;
}

export async function updateHotel(id: string, updates: Partial<Hotel>) {
  const { data, error } = await supabase
    .from("hotels")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Hotel;
}

export async function deleteHotel(id: string) {
  const { error } = await supabase.from("hotels").delete().eq("id", id);
  if (error) throw error;
}

// Dinners
export async function getDinners() {
  const { data, error } = await supabase.from("dinners").select("*");
  if (error) throw error;
  return data as Dinner[];
}

export async function getDinnerById(id: string) {
  const { data, error } = await supabase
    .from("dinners")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Dinner;
}

export async function createDinner(dinner: Omit<Dinner, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("dinners")
    .insert([dinner])
    .select()
    .single();
  if (error) throw error;
  return data as Dinner;
}

export async function updateDinner(id: string, updates: Partial<Dinner>) {
  const { data, error } = await supabase
    .from("dinners")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Dinner;
}

export async function deleteDinner(id: string) {
  const { error } = await supabase.from("dinners").delete().eq("id", id);
  if (error) throw error;
}

// Restaurants
export async function getRestaurants() {
  const { data, error } = await supabase.from("restaurants").select("*");
  if (error) throw error;
  return data as Restaurant[];
}

export async function createRestaurant(
  restaurant: Omit<Restaurant, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("restaurants")
    .insert([restaurant])
    .select()
    .single();
  if (error) throw error;
  return data as Restaurant;
}

export async function deleteRestaurant(id: string) {
  const { error } = await supabase.from("restaurants").delete().eq("id", id);
  if (error) throw error;
}

// Places
export async function getPlaces() {
  const { data, error } = await supabase.from("places").select("*");
  if (error) throw error;
  return data as Place[];
}

export async function createPlace(place: Omit<Place, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("places")
    .insert([place])
    .select()
    .single();
  if (error) throw error;
  return data as Place;
}

export async function deletePlace(id: string) {
  const { error } = await supabase.from("places").delete().eq("id", id);
  if (error) throw error;
}

// Packing
export async function getPackingItems() {
  const { data, error } = await supabase.from("packing").select("*");
  if (error) throw error;
  return data as PackingItem[];
}

export async function createPackingItem(
  item: Omit<PackingItem, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("packing")
    .insert([item])
    .select()
    .single();
  if (error) throw error;
  return data as PackingItem;
}

export async function updatePackingItem(id: string, updates: Partial<PackingItem>) {
  const { data, error } = await supabase
    .from("packing")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as PackingItem;
}

export async function deletePackingItem(id: string) {
  const { error } = await supabase.from("packing").delete().eq("id", id);
  if (error) throw error;
}

// Calendar Events
export async function createCalendarEvent(
  event: Omit<CalendarEvent, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("calendar_events")
    .insert([event])
    .select()
    .single();
  if (error) throw error;
  return data as CalendarEvent;
}

export async function deleteCalendarEvent(id: string) {
  const { error } = await supabase.from("calendar_events").delete().eq("id", id);
  if (error) throw error;
}
