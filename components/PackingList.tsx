"use client";

import { useState, useEffect } from "react";
import { PackingItem } from "@/lib/types";
import { getPackingItems, createPackingItem, updatePackingItem, deletePackingItem } from "@/lib/db";

export function PackingList() {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ item: "", category: "clothing" });

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setIsLoading(true);
      const data = await getPackingItems();
      setItems(data.sort((a, b) => (b.packed ? 1 : a.packed ? -1 : 0)));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createPackingItem({ ...formData, packed: false });
      setFormData({ item: "", category: "clothing" });
      setShowForm(false);
      await loadItems();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggle(id: string, packed: boolean) {
    try {
      await updatePackingItem(id, { packed: !packed });
      await loadItems();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePackingItem(id);
      await loadItems();
    } catch (err) {
      console.error(err);
    }
  }

  if (isLoading) return <p style={{ color: "var(--color-cream-300)" }}>Loading...</p>;

  const packedCount = items.filter((i) => i.packed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--color-cream-300)" }}>
            {packedCount} of {items.length} items packed
          </p>
          {items.length > 0 && (
            <div
              className="mt-2 h-2 w-40 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--color-stone-700)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(packedCount / items.length) * 100}%`,
                  backgroundColor: "var(--color-terracotta)",
                }}
              />
            </div>
          )}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn">
          {showForm ? "Cancel" : "Add Item"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <input type="text" placeholder="Item" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} required className="form-input" />
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="form-input">
            <option value="clothing">Clothing</option>
            <option value="toiletries">Toiletries</option>
            <option value="documents">Documents</option>
            <option value="electronics">Electronics</option>
            <option value="other">Other</option>
          </select>
          <button type="submit" className="btn">Add Item</button>
        </form>
      )}

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg p-3"
              style={{
                backgroundColor: item.packed
                  ? "var(--color-stone-800)"
                  : "var(--color-cream-900)",
                border: "1px solid var(--color-stone-700)",
              }}
            >
              <input
                type="checkbox"
                checked={item.packed}
                onChange={() => handleToggle(item.id, item.packed)}
                className="rounded"
                style={{ accentColor: "var(--color-terracotta)" }}
              />
              <div className="flex-1">
                <p
                  className={item.packed ? "line-through" : ""}
                  style={{
                    color: item.packed
                      ? "var(--color-cream-500)"
                      : "var(--color-cream-100)",
                  }}
                >
                  {item.item}
                </p>
                <p className="text-xs" style={{ color: "var(--color-cream-500)" }}>
                  {item.category}
                </p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-xs transition-colors"
                style={{ color: "var(--color-terracotta)" }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "var(--color-stone-800)" }}>
          <p style={{ color: "var(--color-cream-300)" }}>No items to pack yet</p>
        </div>
      )}
    </div>
  );
}
