"use client";

import { useState, useEffect } from "react";
import { Flight } from "@/lib/types";
import { getFlights, deleteFlight, createFlight, updateFlight } from "@/lib/db";

export function FlightsList() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    airline: "",
    departure_at: "",
    arrival_at: "",
    route: "",
    confirmation_ref: "",
    notes: "",
  });

  useEffect(() => {
    loadFlights();
  }, []);

  async function loadFlights() {
    try {
      setIsLoading(true);
      const data = await getFlights();
      setFlights(data);
    } catch (err) {
      setError("Failed to load flights");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateFlight(editingId, formData);
        setEditingId(null);
      } else {
        await createFlight(formData as any);
      }
      setFormData({
        airline: "",
        departure_at: "",
        arrival_at: "",
        route: "",
        confirmation_ref: "",
        notes: "",
      });
      setShowForm(false);
      await loadFlights();
    } catch (err) {
      setError("Failed to save flight");
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this flight?")) {
      try {
        await deleteFlight(id);
        await loadFlights();
      } catch (err) {
        setError("Failed to delete flight");
        console.error(err);
      }
    }
  }

  if (isLoading) {
    return <p className="text-gray-600 dark:text-gray-400">Loading flights...</p>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
          setFormData({
            airline: "",
            departure_at: "",
            arrival_at: "",
            route: "",
            confirmation_ref: "",
            notes: "",
          });
        }}
        className="btn"
      >
        {showForm ? "Cancel" : "Add Flight"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Airline"
              value={formData.airline}
              onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
              required
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            />
            <input
              type="text"
              placeholder="Route (e.g., LAX → CDG)"
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              required
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            />
            <input
              type="datetime-local"
              placeholder="Departure"
              value={formData.departure_at}
              onChange={(e) => setFormData({ ...formData, departure_at: e.target.value })}
              required
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            />
            <input
              type="datetime-local"
              placeholder="Arrival"
              value={formData.arrival_at}
              onChange={(e) => setFormData({ ...formData, arrival_at: e.target.value })}
              required
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            />
            <input
              type="text"
              placeholder="Confirmation Reference"
              value={formData.confirmation_ref}
              onChange={(e) => setFormData({ ...formData, confirmation_ref: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 sm:col-span-2"
            />
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 sm:col-span-2"
            />
          </div>
          <button type="submit" className="btn">
            {editingId ? "Update Flight" : "Save Flight"}
          </button>
        </form>
      )}

      {flights.length > 0 ? (
        <div className="space-y-4">
          {flights.map((flight) => (
            <div
              key={flight.id}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{flight.airline}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{flight.route}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(flight.id);
                      setFormData({
                        airline: flight.airline,
                        departure_at: flight.departure_at,
                        arrival_at: flight.arrival_at,
                        route: flight.route,
                        confirmation_ref: flight.confirmation_ref || "",
                        notes: flight.notes || "",
                      });
                      setShowForm(true);
                    }}
                    className="btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(flight.id)}
                    className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-50 dark:border-red-600 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  {new Date(flight.departure_at).toLocaleString()} →{" "}
                  {new Date(flight.arrival_at).toLocaleString()}
                </p>
                {flight.confirmation_ref && <p>Ref: {flight.confirmation_ref}</p>}
                {flight.notes && <p className="mt-1">{flight.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">No flights yet</p>
        </div>
      )}
    </div>
  );
}
