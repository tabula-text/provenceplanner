import { Calendar } from "@/components/Calendar";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Calendar</h1>
        <p className="page-subtitle">
          Aggregated view of all trip events
        </p>
      </div>

      <Calendar />
    </div>
  );
}
