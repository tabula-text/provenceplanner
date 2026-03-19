import { TrainsList } from "@/components/TrainsList";

export default function TrainsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Trains</h1>
        <p className="page-subtitle">
          Manage train bookings for your trip
        </p>
      </div>

      <TrainsList />
    </div>
  );
}
