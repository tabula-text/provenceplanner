import { HotelsList } from "@/components/HotelsList";

export default function HotelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🏨 Hotels</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage hotel reservations for your trip
        </p>
      </div>

      <HotelsList />
    </div>
  );
}
