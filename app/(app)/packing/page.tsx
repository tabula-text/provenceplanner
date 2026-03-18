import { PackingList } from "@/components/PackingList";

export default function PackingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🧳 Packing</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create and track packing checklist items
        </p>
      </div>

      <PackingList />
    </div>
  );
}
