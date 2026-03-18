"use client";

import { useState, useEffect } from "react";
import { Dinner } from "@/lib/types";
import { getDinners, deleteDinner, createDinner, updateDinner } from "@/lib/db";

export function DinnersList() {
  const [dinners, setDinners] = useState<Dinner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    cuisine_or_theme: "",
    assigned_cook: "",
    notes: "",
    is_private_chef: false,
  });

  useEffect(() => {
    loadDinners();
  }, []);

  async function loadDinners() {
    try {
      setIsLoading(true);
      const data = await getDinners();
      setDinners(data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (err) {
      setError("Failed to load dinners");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDinner(editingId, formData);
        setEditingId(null);
      } else {
        await createDinner(formData as any);
      }
      setFormData({
        date: "",
        cuisine_or_theme: "",
        assigned_cook: "",
        notes: "",
        is_private_chef: false,
      });
      setShowForm(false);
      await loadDinners();
    } catch (err) {
      setError("Failed to save dinner");
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this dinner?")) {
      try {
        await deleteDinner(id);
        await loadDinners();
      } catch (err) {
        setError("Failed to delete dinner");
        console.error(err);
      }
    }
  }

  if (isLoading) {
    return <p className="text-gray-600 dark:text-gray-400">Loading dinners...</p>;
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
            date: "",
            cuisine_or_theme: "",
            assigned_cook: "",
            notes: "",
            is_private_chef: false,
          });
        }}
        className="btn"
      >
        {showForm ? "Cancel" : "Add Dinner"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            />
            <input
              type="text"
              placeholder="Cuisine or Theme"
              value={formData.cuisine_or_theme}
              onChange={(e) => setFormData({ ...formData, cuisine_or_theme: e.target.value })}
              required
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            />
            <input
              type="text"
              placeholder="Assigned Cook"
              value={formData.assigned_cook}
              onChange={(e) => setFormData({ ...formData, assigned_cook: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_private_chef}
                onChange={(e) => setFormData({ ...formData, is_private_chef: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span>Private Chef</span>
            </label>
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 sm:col-span-2"
            />
          </div>
          <button type="submit" className="btn">
            {editingId ? "Update Dinner" : "Save Dinner"}
          </button>
        </form>
      )}

      {dinners.length > 0 ? (
        <div className="space-y-4">
          {dinners.map((dinner) => (
            <div
              key={dinner.id}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{dinner.cuisine_or_theme}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(dinner.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(dinner.id);
                      setFormData({
                        date: dinner.date,
                        cuisine_or_theme: dinner.cuisine_or_theme,
                        assigned_cook: dinner.assigned_cook || "",
                        notes: dinner.notes || "",
                        is_private_chef: dinner.is_private_chef,
                      });
                      setShowForm(true);
                    }}
                    className="btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dinner.id)}
                    className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-50 dark:border-red-600 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {dinner.assigned_cook && <p>Cook: {dinner.assigned_cook}</p>}
                {dinner.is_private_chef && <p>👨‍🍳 Private Chef</p>}
                {dinner.notes && <p className="mt-1">{dinner.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">No dinners planned yet</p>
        </div>
      )}
    </div>
  );
}
