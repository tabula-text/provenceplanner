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
    return <p style={{ color: "var(--color-cream-300)" }}>Loading dinners...</p>;
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
              placeholder="Cuisine or Theme"
              value={formData.cuisine_or_theme}
              onChange={(e) => setFormData({ ...formData, cuisine_or_theme: e.target.value })}
              required
              className="form-input"
            />
            <input
              type="text"
              placeholder="Assigned Cook"
              value={formData.assigned_cook}
              onChange={(e) => setFormData({ ...formData, assigned_cook: e.target.value })}
              className="form-input"
            />
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-cream-300)" }}>
              <input
                type="checkbox"
                checked={formData.is_private_chef}
                onChange={(e) => setFormData({ ...formData, is_private_chef: e.target.checked })}
                className="rounded"
              />
              <span>Private Chef</span>
            </label>
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-input sm:col-span-2"
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
            <div key={dinner.id} className="card">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--color-cream-100)" }}>
                    {dinner.cuisine_or_theme}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-cream-300)" }}>
                    {new Date(dinner.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {dinner.is_private_chef && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: "rgba(155, 127, 200, 0.15)",
                        color: "var(--color-lavender)",
                        border: "1px solid rgba(155, 127, 200, 0.3)",
                      }}
                    >
                      Private Chef
                    </span>
                  )}
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
                  <button onClick={() => handleDelete(dinner.id)} className="btn-danger">
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-sm" style={{ color: "var(--color-cream-500)" }}>
                {dinner.assigned_cook && <p>Cook: {dinner.assigned_cook}</p>}
                {dinner.notes && <p className="mt-1">{dinner.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "var(--color-stone-800)" }}>
          <p style={{ color: "var(--color-cream-300)" }}>No dinners planned yet</p>
        </div>
      )}
    </div>
  );
}
