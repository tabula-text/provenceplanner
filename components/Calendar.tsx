"use client";

import { useState, useEffect } from "react";
import { getCalendarEvents } from "@/lib/db";
import { TRIP_START, TRIP_END } from "@/lib/constants";
import { CalendarItem } from "@/lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getChipClass(type: string): string {
  const map: Record<string, string> = {
    flight: "chip-flight",
    train: "chip-train",
    hotel: "chip-hotel",
    dinner: "chip-dinner",
    event: "chip-event",
  };
  return map[type] ?? "chip-event";
}

// Build a 35-cell grid starting Mon Apr 29, ending Sun Jun 2
const firstOfMay = new Date(2026, 3, 15);
const dayOfWeek = (firstOfMay.getDay() + 6) % 7; // Mon=0
const gridStart = new Date(firstOfMay);
gridStart.setDate(firstOfMay.getDate() - dayOfWeek); // Apr 29
const GRID_CELLS = Array.from({ length: 35 }, (_, i) => {
  const d = new Date(gridStart);:
  d.setDate(gridStart.getDate() + i);
  return d;
});

const TRIP_START_DATE = new Date(TRIP_START + "T00:00:00");
const TRIP_END_DATE = new Date(TRIP_END + "T00:00:00");

function isTripDay(d: Date): boolean {
  return d >= TRIP_START_DATE && d <= TRIP_END_DATE;
}

function isCurrentMonth(d: Date): boolean {
  return d.getMonth() === 4; // May
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function Calendar() {
  const [events, setEvents] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setIsLoading(true);
        const calendarEvents = await getCalendarEvents(TRIP_START, TRIP_END);
        setEvents(calendarEvents);
      } catch (err) {
        setError("Failed to load calendar events");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, []);

  const getDayEvents = (dateStr: string) =>
    events.filter((event) => event.date === dateStr);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p style={{ color: "var(--color-cream-300)" }}>Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor: "rgba(196, 98, 45, 0.1)",
          color: "var(--color-terracotta)",
          border: "1px solid var(--color-terracotta-dim)",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month header */}
      <div className="flex items-end justify-between">
        <h2 className="page-title">March-April 2026</h2>
        <p className="section-label">March 20th - April 8th · Southern France</p>
      </div>

      {/* Chip legend */}
      <div className="flex flex-wrap gap-2">
        {(["flight", "train", "hotel", "dinner", "event"] as const).map(
          (type) => (
            <span key={type} className={getChipClass(type)}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          )
        )}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="section-label py-2 text-center text-xs"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid — gap-px + container bg = hairline borders */}
      <div
        className="grid grid-cols-7 gap-px"
        style={{ backgroundColor: "var(--color-stone-700)" }}
      >
        {GRID_CELLS.map((cellDate) => {
          const dateStr = toDateStr(cellDate);
          const inTrip = isTripDay(cellDate);
          const inMonth = isCurrentMonth(cellDate);
          const dayEvents = getDayEvents(dateStr);
          const isSelected = selectedDate === dateStr;
          const dayNum = cellDate.getDate();

          // Cell background
          const cellBg = inMonth
            ? "var(--color-cream-900)"
            : "var(--color-stone-900)";

          return (
            <div
              key={dateStr}
              className="min-h-[100px] p-2 flex flex-col gap-1"
              style={{
                backgroundColor: cellBg,
                boxShadow: inTrip
                  ? "inset 0 0 0 1px rgba(212, 148, 58, 0.30)"
                  : undefined,
              }}
            >
              {/* Day number */}
              <div className="flex items-start justify-between">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                  style={
                    inTrip
                      ? {
                          backgroundColor: "var(--color-terracotta)",
                          color: "var(--color-cream-100)",
                        }
                      : {
                          color: inMonth
                            ? "var(--color-cream-300)"
                            : "var(--color-cream-500)",
                        }
                  }
                >
                  {dayNum}
                </span>

                {inTrip && (
                  <button
                    onClick={() =>
                      setSelectedDate(isSelected ? null : dateStr)
                    }
                    className="text-xs transition-colors"
                    style={{ color: "var(--color-cream-500)" }}
                    title="Quick add"
                  >
                    {isSelected ? "✕" : "+"}
                  </button>
                )}
              </div>

              {/* Event chips */}
              {dayEvents.slice(0, 3).map((event) => (
                <span key={event.id} className={getChipClass(event.type)}>
                  {event.title}
                </span>
              ))}

              {dayEvents.length > 3 && (
                <span
                  className="text-xs"
                  style={{ color: "var(--color-cream-500)" }}
                >
                  +{dayEvents.length - 3} more
                </span>
              )}

              {/* Quick add panel */}
              {isSelected && inTrip && (
                <div
                  className="mt-1 rounded px-2 py-1 text-xs"
                  style={{
                    borderTop: "1px solid var(--color-stone-700)",
                    color: "var(--color-cream-500)",
                  }}
                >
                  Quick add — coming soon
                </div>
              )}
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{
            backgroundColor: "var(--color-stone-800)",
            color: "var(--color-cream-300)",
            border: "1px solid var(--color-stone-700)",
          }}
        >
          No events yet. Add flights, trains, hotels, or dinners from their
          respective pages to see them here.
        </div>
      )}
    </div>
  );
}
