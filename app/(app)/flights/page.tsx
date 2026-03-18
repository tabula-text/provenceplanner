import { FlightsList } from "@/components/FlightsList";

export default function FlightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">✈️ Flights</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage flight bookings for your trip
        </p>
      </div>

      <FlightsList />
    </div>
  );
}
