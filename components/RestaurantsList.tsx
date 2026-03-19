"use client";

import { useState, useEffect } from "react";
import { Restaurant } from "@/lib/types";
import { getRestaurants, deleteRestaurant, createRestaurant } from "@/lib/db";

export function RestaurantsList() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", location: "", cuisine: "", url: "", notes: "" });

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function loadRestaurants() {
    try {
      setIsLoading(true);
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (err) {
      setError("Failed to load restaurants");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createRestaurant(formData as any);
      setFormData({ name: "", location: "", cuisine: "", url: "", notes: "" });
      setShowForm(false);
      await loadRestaurants();
    } catch (err) {
      setError("Failed to save restaurant");
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this restaurant?")) {
      try {
        await deleteRestaurant(id);
        await loadRestaurants();
      } catch (err) {
        setError("Failed to delete restaurant");
      }
    }
  }

  if (isLoading) return <p style={{ color: "var(--color-cream-300)" }}>Loading...</p>;
  if (error) return <div style={{ color: "var(--color-terracotta)" }}>{error}</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => setShowForm(!showForm)} className="btn">
        {showForm ? "Cancel" : "Add Restaurant"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="form-input" />
          <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required className="form-input" />
          <input type="text" placeholder="Cuisine" value={formData.cuisine} onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })} required className="form-input" />
          <input type="url" placeholder="Website" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="form-input" />
          <textarea placeholder="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="form-input" />
          <button type="submit" className="btn">Save Restaurant</button>
        </form>
      )}

      {restaurants.length > 0 ? (
        <div className="space-y-4">
          {restaurants.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--color-cream-100)" }}>{r.name}</h3>
                  <p className="text-sm" style={{ color: "var(--color-cream-300)" }}>{r.cuisine} · {r.location}</p>
                </div>
                <button onClick={() => handleDelete(r.id)} className="btn-danger">Delete</button>
              </div>
              {r.url && (
                <p className="mt-2 text-sm">
                  <a href={r.url} target="_blank" rel="noopener" style={{ color: "var(--color-saffron)" }} className="hover:underline">
                    Visit website
                  </a>
                </p>
              )}
              {r.notes && <p className="mt-1 text-sm" style={{ color: "var(--color-cream-500)" }}>{r.notes}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "var(--color-stone-800)" }}>
          <p style={{ color: "var(--color-cream-300)" }}>No restaurants yet</p>
        </div>
      )}
    </div>
  );
}
