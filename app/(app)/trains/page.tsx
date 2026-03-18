import { TrainsList } from "@/components/TrainsList";

export default function TrainsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🚂 Trains</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage train bookings for your trip
        </p>
      </div>

      <TrainsList />
    </div>
  );
}
