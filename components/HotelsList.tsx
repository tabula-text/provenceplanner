"use client";

import { useState, useEffect } from "react";
import { Hotel } from "@/lib/types";
import { getHotels, deleteHotel, createHotel, updateHotel } from "@/lib/db";

export function HotelsList() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    check_in: "",
    check_out: "",
    location: "",
    confirmation_ref: "",
    notes: "",
  });

  useEffect(() => {
    loadHotels();
  }, []);

  async function loadHotels() {
    try {
      setIsLoading(true);
      const data = await getHotels();
      setHotels(data);
    } catch (err) {
      setError("Failed to load hotels");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateHotel(editingId, formData);
        setEditingId(null);
      } else {
        await createHotel(formData as any);
      }
      setFormData({
        name: "",
        check_in: "",
        check_out: "",
        location: "",
        confirmation_ref: "",
        notes: "",
      });
      setShowForm(false);
      await loadHotels();
    } catch (err) {
      setError("Failed to save hotel");
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this hotel?")) {
      try {
        await deleteHotel(id);
        await loadHotels();
      } catch (err) {
        setError("Failed to delete hotel");
        console.error(err);
      }
    }
  }

  if (isLoading) {
    return <p style={{ color: "var(--color-cream-300)" }}>Loading hotels...</p>;
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
          setFormData({
            name: "",
            check_in: "",
            check_out: "",
            location: "",
            confirmation_ref: "",
            notes: "",
          });
        }}
        className="btn"
      >
        {showForm ? "Cancel" : "Add Hotel"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Hotel Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="form-input sm:col-span-2"
            />
            <input
              type="date"
              value={formData.check_in}
              onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
              required
              className="form-input"
            />
            <input
              type="date"
              value={formData.check_out}
              onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
              required
              className="form-input"
            />
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              className="form-input sm:col-span-2"
            />
            <input
              type="text"
              placeholder="Confirmation Reference"
              value={formData.confirmation_ref}
              onChange={(e) => setFormData({ ...formData, confirmation_ref: e.target.value })}
              className="form-input sm:col-span-2"
            />
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-input sm:col-span-2"
            />
          </div>
          <button type="submit" className="btn">
            {editingId ? "Update Hotel" : "Save Hotel"}
          </button>
        </form>
      )}

      {hotels.length > 0 ? (
        <div className="space-y-4">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="card">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3
                    className="font-display text-lg font-semibold"
                    style={{ color: "var(--color-cream-100)" }}
                  >
                    {hotel.name}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-cream-300)" }}>
                    {hotel.location}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(hotel.id);
                      setFormData({
                        name: hotel.name,
                        check_in: hotel.check_in,
                        check_out: hotel.check_out,
                        location: hotel.location,
                        confirmation_ref: hotel.confirmation_ref || "",
                        notes: hotel.notes || "",
                      });
                      setShowForm(true);
                    }}
                    className="btn-secondary"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(hotel.id)} className="btn-danger">
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-sm" style={{ color: "var(--color-cream-500)" }}>
                <p>
                  {hotel.check_in} to {hotel.check_out}
                </p>
                {hotel.confirmation_ref && <p>Ref: {hotel.confirmation_ref}</p>}
                {hotel.notes && <p className="mt-1">{hotel.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "var(--color-stone-800)" }}>
          <p style={{ color: "var(--color-cream-300)" }}>No hotels yet</p>
        </div>
      )}
    </div>
  );
}
