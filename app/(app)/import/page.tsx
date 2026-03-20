import { ImportWizard } from "@/components/ImportWizard";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Import</h1>
        <p className="page-subtitle">Bulk import trip data from a JSON or CSV file</p>
      </div>
      <ImportWizard />
    </div>
  );
}
