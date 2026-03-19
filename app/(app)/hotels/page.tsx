import { HotelsList } from "@/components/HotelsList";

export default function HotelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Hotels</h1>
        <p className="page-subtitle">
          Manage hotel reservations for your trip
        </p>
      </div>

      <HotelsList />
    </div>
  );
}
