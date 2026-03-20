"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { mapFile, SectionName, ImportResult } from "@/lib/import";
import { supabase } from "@/lib/supabase";

type Step = "upload" | "preview" | "result";

const SECTION_OPTIONS: { value: SectionName; label: string }[] = [
  { value: "flights", label: "Flights" },
  { value: "trains", label: "Trains" },
  { value: "hotels", label: "Hotels" },
  { value: "dinners", label: "Dinners" },
  { value: "restaurants", label: "Restaurants" },
  { value: "places", label: "Places" },
  { value: "packing", label: "Packing" },
  { value: "events", label: "Events" },
];

const TABLE_NAMES: Record<SectionName, string> = {
  flights: "flights",
  trains: "trains",
  hotels: "hotels",
  dinners: "dinners",
  restaurants: "restaurants",
  places: "places",
  packing: "packing",
  events: "calendar_events",
};

function parseJSON(text: string): Record<string, unknown>[] | null {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as Record<string, unknown>[];
    if (typeof parsed === "object" && parsed !== null) {
      const arrays = Object.values(parsed).filter(Array.isArray) as Record<string, unknown>[][];
      if (arrays.length === 0) return null;
      return arrays.reduce((a, b) => (b.length > a.length ? b : a));
    }
    return null;
  } catch {
    return null;
  }
}

export function ImportWizard() {
  const [section, setSection] = useState<SectionName>("flights");
  const [step, setStep] = useState<Step>("upload");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importCount, setImportCount] = useState<number | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSectionChange(newSection: SectionName) {
    setSection(newSection);
    setStep("upload");
    setImportResult(null);
    setParseError(null);
    setImportCount(null);
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);

    const text = await file.text();
    let rawRows: Record<string, unknown>[] | null = null;

    if (file.name.endsWith(".csv")) {
      const parsed = Papa.parse<Record<string, unknown>>(text, {
        header: true,
        skipEmptyLines: true,
      });
      rawRows = parsed.data;
    } else if (file.name.endsWith(".json")) {
      rawRows = parseJSON(text);
    } else {
      setParseError("Unsupported file type. Upload a .json or .csv file.");
      return;
    }

    if (!rawRows || rawRows.length === 0) {
      setParseError("Could not parse file or file is empty.");
      return;
    }

    const result = mapFile(rawRows, section);
    setImportResult(result);

    if (result.missingRequired.length > 0) {
      const fields = result.missingRequired.map((f) => `\`${f}\``).join(", ");
      const plural = result.missingRequired.length > 1;
      setParseError(
        `Required field${plural ? "s" : ""} could not be mapped: ${fields}. Rename the column${plural ? "s" : ""} in your file and re-upload.`
      );
      return;
    }

    setStep("preview");
  }

  async function handleConfirm() {
    if (!importResult) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES[section])
        .insert(importResult.mappedRows)
        .select();
      if (error) throw error;
      setImportCount(data.length);
      setStep("result");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  }

  function handleReset() {
    setStep("upload");
    setImportResult(null);
    setParseError(null);
    setImportCount(null);
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const previewRows = importResult?.mappedRows.slice(0, 10) ?? [];
  const previewColumns = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

  return (
    <div className="space-y-6">
      {/* Section select — always visible */}
      <div className="card space-y-2">
        <label className="section-label block">Import into</label>
        <select
          value={section}
          onChange={(e) => handleSectionChange(e.target.value as SectionName)}
          className="form-input"
        >
          {SECTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Step: upload */}
      {step === "upload" && (
        <div className="card space-y-4">
          <p className="text-sm" style={{ color: "var(--color-cream-300)" }}>
            Upload a <code>.json</code> or <code>.csv</code> file. Column names
            will be auto-mapped to {section} fields.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileUpload}
            className="form-input"
          />
          {parseError && (
            <p className="text-sm" style={{ color: "var(--color-terracotta)" }}>
              {parseError}
            </p>
          )}
        </div>
      )}

      {/* Step: preview */}
      {step === "preview" && importResult && (
        <div className="space-y-4">
          <div className="card space-y-4">
            <p className="text-sm" style={{ color: "var(--color-cream-300)" }}>
              Previewing first {previewRows.length} of{" "}
              {importResult.mappedRows.length} rows.
            </p>

            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ color: "var(--color-cream-200)" }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-stone-700)" }}>
                    {previewColumns.map((col) => (
                      <th key={col} className="px-2 py-1 text-left font-medium">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--color-stone-800)" }}>
                      {previewColumns.map((col) => (
                        <td key={col} className="px-2 py-1">
                          {String(row[col] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {importResult.unmappedColumns.length > 0 && (
              <div>
                <p className="section-label mb-1 text-xs">Ignored columns</p>
                <div className="flex flex-wrap gap-1">
                  {importResult.unmappedColumns.map((col) => (
                    <span
                      key={col}
                      className="rounded px-1.5 py-0.5 text-xs"
                      style={{
                        backgroundColor: "var(--color-stone-800)",
                        color: "var(--color-cream-500)",
                      }}
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {importError && (
            <p className="text-sm" style={{ color: "var(--color-terracotta)" }}>
              {importError}
            </p>
          )}

          <div className="flex gap-3">
            <button onClick={handleConfirm} disabled={isImporting} className="btn">
              {isImporting
                ? "Importing…"
                : `Import ${importResult.mappedRows.length} rows`}
            </button>
            <button onClick={handleReset} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step: result */}
      {step === "result" && (
        <div className="card space-y-4">
          <p className="font-semibold" style={{ color: "var(--color-cream-100)" }}>
            Imported {importCount} {section} successfully.
          </p>
          <button onClick={handleReset} className="btn-secondary">
            Import another file
          </button>
        </div>
      )}
    </div>
  );
}
