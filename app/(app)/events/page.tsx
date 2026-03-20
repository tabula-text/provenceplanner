import { EventsList } from "@/components/EventsList";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Events</h1>
        <p className="page-subtitle">Manage manual calendar events</p>
      </div>
      <EventsList />
    </div>
  );
}
