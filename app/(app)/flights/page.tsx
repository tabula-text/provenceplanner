import { FlightsList } from "@/components/FlightsList";

export default function FlightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Flights</h1>
        <p className="page-subtitle">
          Manage flight bookings for your trip
        </p>
      </div>

      <FlightsList />
    </div>
  );
}
