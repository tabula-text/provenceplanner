import { DinnersList } from "@/components/DinnersList";

export default function DinnersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dinners</h1>
        <p className="page-subtitle">
          Plan family dinners and themes
        </p>
      </div>

      <DinnersList />
    </div>
  );
}
