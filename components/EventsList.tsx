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
