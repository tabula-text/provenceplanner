"use client";

import { useState, useEffect } from "react";
import { getCalendarEvents } from "@/lib/db";
import { TRIP_START, TRIP_END } from "@/lib/constants";
import { CalendarItem } from "@/lib/types";

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

  const startDate = new Date(TRIP_START);
  const endDate = new Date(TRIP_END);
  const daysInRange = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const getDayEvents = (date: string) => {
    return events.filter((event) => event.date === date);
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      "bg-blue-500": "bg-blue-100 dark:bg-blue-900",
      "bg-orange-500": "bg-orange-100 dark:bg-orange-900",
      "bg-green-500": "bg-green-100 dark:bg-green-900",
      "bg-red-500": "bg-red-100 dark:bg-red-900",
      "bg-purple-500": "bg-purple-100 dark:bg-purple-900",
    };
    return colorMap[color] || "bg-gray-100 dark:bg-gray-900";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {startDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}{" "}
          Trip Calendar
        </h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {TRIP_START} to {TRIP_END} ({daysInRange} days)
        </p>
      </div>

      <div className="grid gap-4">
        {Array.from({ length: daysInRange }).map((_, index) => {
          const currentDate = new Date(startDate);
          currentDate.setDate(currentDate.getDate() + index);
          const dateStr = currentDate.toISOString().split("T")[0];
          const dayEvents = getDayEvents(dateStr);
          const dayName = currentDate.toLocaleDateString("en-US", {
            weekday: "short",
          });
          const dayNum = currentDate.getDate();

          return (
            <div
              key={dateStr}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{dayName}</p>
                  <p className="text-2xl font-bold">{dayNum}</p>
                </div>
                <button
                  onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                  className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-900 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
                >
                  {selectedDate === dateStr ? "Hide" : "Add"}
                </button>
              </div>

              {dayEvents.length > 0 ? (
                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`rounded-md p-2 text-sm font-medium ${getColorClass(
                        event.color
                      )}`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No events scheduled
                </p>
              )}

              {selectedDate === dateStr && (
                <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Quick add event (coming in next phase)
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="rounded-lg bg-blue-50 p-4 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100">
          <p>No events yet. Add flights, trains, hotels, or dinners from their respective pages to see them appear here!</p>
        </div>
      )}
    </div>
  );
}
