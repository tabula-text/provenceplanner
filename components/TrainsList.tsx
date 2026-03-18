"use client";

import { useState, useEffect } from "react";
import { Train } from "@/lib/types";
import { getTrains, deleteTrain, createTrain, updateTrain } from "@/lib/db";

export function TrainsList() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    operator: "",
    departure_at: "",
    arrival_at: "",
    route: "",
    booking_ref: "",
    seat: "",
    notes: "",
  });

  useEffect(() => {
    loadTrains();
  }, []);

  async function loadTrains() {
    try {
      setIsLoading(true);
      const data = await getTrains();
      setTrains(data);
    } catch (err) {
      setError("Failed to load trains");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTrain(editingId, formData);
        setEditingId(null);
      } else {
        await createTrain(formData as any);
      }
      setFormData({
        operator: "",
        departure_at: "",
        arrival_at: "",
        route: "",
        booking_ref: "",
        seat: "",
        notes: "",
      });
      setShowForm(false);
      await loadTrains();
    } catch (err) {
      setError("Failed to save train");
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this train?")) {
      try {
        await deleteTrain(id);
        await loadTrains();
      } catch (err) {
        setError("Failed to delete train");
        console.error(err);
      }
    }
  }

  if (isLoading) {
    return <p className="text-gray-600 dark:text-gray-400">Loading trains...</p>;
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
            operator: "",
            departure_at: "",
            arrival_at: "",
            route: "",
            booking_ref: "",
            seat: "",
            notes: "",
          });
        }}
        className="btn"
      >
        {showForm ? "Cancel" : "Add Train"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Operator (e.g., SNCF)"
              value={formData.operator}
              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              required
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            />
            <input
              type="text"
              placeholder="Route (e.g., Paris → Lyon)"
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
              placeholder="Booking Reference"
              value={formData.booking_ref}
              onChange={(e) => setFormData({ ...formData, booking_ref: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            />
            <input
              type="text"
              placeholder="Seat (e.g., 12A)"
              value={formData.seat}
              onChange={(e) => setFormData({ ...formData, seat: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            />
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 sm:col-span-2"
            />
          </div>
          <button type="submit" className="btn">
            {editingId ? "Update Train" : "Save Train"}
          </button>
        </form>
      )}

      {trains.length > 0 ? (
        <div className="space-y-4">
          {trains.map((train) => (
            <div
              key={train.id}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{train.operator}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{train.route}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(train.id);
                      setFormData({
                        operator: train.operator,
                        departure_at: train.departure_at,
                        arrival_at: train.arrival_at,
                        route: train.route,
                        booking_ref: train.booking_ref || "",
                        seat: train.seat || "",
                        notes: train.notes || "",
                      });
                      setShowForm(true);
                    }}
                    className="btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(train.id)}
                    className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-50 dark:border-red-600 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  {new Date(train.departure_at).toLocaleString()} →{" "}
                  {new Date(train.arrival_at).toLocaleString()}
                </p>
                {train.seat && <p>Seat: {train.seat}</p>}
                {train.booking_ref && <p>Booking: {train.booking_ref}</p>}
                {train.notes && <p className="mt-1">{train.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">No trains yet</p>
        </div>
      )}
    </div>
  );
}
