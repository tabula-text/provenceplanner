import { PackingList } from "@/components/PackingList";

export default function PackingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Packing</h1>
        <p className="page-subtitle">
          Create and track packing checklist items
        </p>
      </div>

      <PackingList />
    </div>
  );
}
