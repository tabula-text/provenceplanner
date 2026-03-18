import { PlacesList } from "@/components/PlacesList";

export default function PlacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🗺️ Places</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Curate must-see destinations in Provence
        </p>
      </div>

      <PlacesList />
    </div>
  );
}
