"use client";

import { useState, useEffect } from "react";
import { Place } from "@/lib/types";
import { getPlaces, deletePlace, createPlace } from "@/lib/db";

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

  if (isLoading) return <p className="text-gray-600 dark:text-gray-400">Loading...</p>;

  return (
    <div className="space-y-6">
      <button onClick={() => setShowForm(!showForm)} className="btn">{showForm ? "Cancel" : "Add Place"}</button>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <input type="text" placeholder="Place Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
          <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
          <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
          <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800">
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <input type="url" placeholder="Website" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
          <button type="submit" className="btn">Save Place</button>
        </form>
      )}

      {places.length > 0 ? (
        <div className="space-y-4">
          {places.map((p) => (
            <div key={p.id} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between">
                <div><h3 className="font-semibold">{p.name} {p.priority === "high" ? "⭐" : ""}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{p.location}</p></div>
                <button onClick={() => handleDelete(p.id)} className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-50 dark:border-red-600 dark:bg-gray-900 dark:text-red-400">Delete</button>
              </div>
              {p.description && <p className="mt-2 text-sm">{p.description}</p>}
              {p.url && <p className="mt-1 text-sm"><a href={p.url} target="_blank" rel="noopener" className="text-blue-600 hover:underline dark:text-blue-400">Learn more</a></p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-900"><p className="text-gray-600 dark:text-gray-400">No places yet</p></div>
      )}
    </div>
  );
}
