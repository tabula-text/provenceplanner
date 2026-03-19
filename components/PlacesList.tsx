"use client";

import { useState, useEffect } from "react";
import { Place } from "@/lib/types";
import { getPlaces, deletePlace, createPlace } from "@/lib/db";

const PRIORITY_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  high: { bg: "rgba(196, 98, 45, 0.15)", color: "var(--color-terracotta)", label: "High" },
  medium: { bg: "rgba(212, 148, 58, 0.15)", color: "var(--color-saffron)", label: "Medium" },
  low: { bg: "rgba(61, 48, 32, 0.8)", color: "var(--color-cream-500)", label: "Low" },
};

export function PlacesList() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", location: "", url: "", priority: "medium" as const });

  useEffect(() => {
    loadPlaces();
  }, []);

  async function loadPlaces() {
    try {
      setIsLoading(true);
      const data = await getPlaces();
      setPlaces(data.sort((a, b) => (b.priority === "high" ? 1 : a.priority === "high" ? -1 : 0)));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createPlace(formData as any);
      setFormData({ name: "", description: "", location: "", url: "", priority: "medium" });
      setShowForm(false);
      await loadPlaces();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this place?")) {
      try {
        await deletePlace(id);
        await loadPlaces();
      } catch (err) {
        console.error(err);
      }
    }
  }

  if (isLoading) return <p style={{ color: "var(--color-cream-300)" }}>Loading...</p>;

  return (
    <div className="space-y-6">
      <button onClick={() => setShowForm(!showForm)} className="btn">
        {showForm ? "Cancel" : "Add Place"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <input type="text" placeholder="Place Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="form-input" />
          <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="form-input" />
          <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="form-input" />
          <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} className="form-input">
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <input type="url" placeholder="Website" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="form-input" />
          <button type="submit" className="btn">Save Place</button>
        </form>
      )}

      {places.length > 0 ? (
        <div className="space-y-4">
          {places.map((p) => {
            const ps = PRIORITY_STYLES[p.priority ?? "medium"] ?? PRIORITY_STYLES.medium;
            return (
              <div key={p.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 rounded px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: ps.bg, color: ps.color }}
                    >
                      {ps.label}
                    </span>
                    <div>
                      <h3 className="font-semibold" style={{ color: "var(--color-cream-100)" }}>{p.name}</h3>
                      <p className="text-sm" style={{ color: "var(--color-cream-300)" }}>{p.location}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(p.id)} className="btn-danger">Delete</button>
                </div>
                {p.description && <p className="mt-2 text-sm" style={{ color: "var(--color-cream-300)" }}>{p.description}</p>}
                {p.url && (
                  <p className="mt-1 text-sm">
                    <a href={p.url} target="_blank" rel="noopener" style={{ color: "var(--color-saffron)" }} className="hover:underline">
                      Learn more
                    </a>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "var(--color-stone-800)" }}>
          <p style={{ color: "var(--color-cream-300)" }}>No places yet</p>
        </div>
      )}
    </div>
  );
}
