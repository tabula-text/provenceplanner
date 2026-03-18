import { DinnersList } from "@/components/DinnersList";

export default function DinnersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🍽️ Dinners</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Plan family dinners and themes
        </p>
      </div>

      <DinnersList />
    </div>
  );
}
