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

  if (isLoading) return <p className="text-gray-600 dark:text-gray-400">Loading...</p>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => setShowForm(!showForm)} className="btn">
        {showForm ? "Cancel" : "Add Restaurant"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
          <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
          <input type="text" placeholder="Cuisine" value={formData.cuisine} onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })} required className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
          <input type="url" placeholder="Website" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
          <textarea placeholder="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
          <button type="submit" className="btn">Save Restaurant</button>
        </form>
      )}

      {restaurants.length > 0 ? (
        <div className="space-y-4">
          {restaurants.map((r) => (
            <div key={r.id} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between">
                <div><h3 className="font-semibold">{r.name}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{r.cuisine} • {r.location}</p></div>
                <button onClick={() => handleDelete(r.id)} className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-50 dark:border-red-600 dark:bg-gray-900 dark:text-red-400">Delete</button>
              </div>
              {r.url && <p className="mt-2 text-sm"><a href={r.url} target="_blank" rel="noopener" className="text-blue-600 hover:underline dark:text-blue-400">Visit website</a></p>}
              {r.notes && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{r.notes}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-900"><p className="text-gray-600 dark:text-gray-400">No restaurants yet</p></div>
      )}
    </div>
  );
}
