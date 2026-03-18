import { Calendar } from "@/components/Calendar";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📅 Calendar</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Aggregated view of all trip events
        </p>
      </div>

      <Calendar />
    </div>
  );
}
