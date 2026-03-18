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

  if (isLoading) return <p className="text-gray-600 dark:text-gray-400">Loading...</p>;

  const packedCount = items.filter((i) => i.packed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {packedCount} of {items.length} items packed
          </p>
          {items.length > 0 && (
            <div className="mt-2 h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${(packedCount / items.length) * 100}%` }} />
            </div>
          )}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn">{showForm ? "Cancel" : "Add Item"}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <input type="text" placeholder="Item" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} required className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800">
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
            <div key={item.id} className={`flex items-center gap-3 rounded-lg p-3 ${item.packed ? "bg-gray-100 dark:bg-gray-800" : "bg-white dark:bg-gray-900"} border border-gray-200 dark:border-gray-800`}>
              <input
                type="checkbox"
                checked={item.packed}
                onChange={() => handleToggle(item.id, item.packed)}
                className="rounded border-gray-300"
              />
              <div className="flex-1">
                <p className={item.packed ? "line-through text-gray-500 dark:text-gray-400" : ""}>{item.item}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
              </div>
              <button onClick={() => handleDelete(item.id)} className="text-xs text-red-600 hover:text-red-700 dark:text-red-400">Delete</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-900"><p className="text-gray-600 dark:text-gray-400">No items to pack yet</p></div>
      )}
    </div>
  );
}
