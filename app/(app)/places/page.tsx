import { PlacesList } from "@/components/PlacesList";

export default function PlacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Places</h1>
        <p className="page-subtitle">
          Curate must-see destinations in Provence
        </p>
      </div>

      <PlacesList />
    </div>
  );
}
