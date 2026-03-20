import { describe, it, expect } from "vitest";
import { mapFile } from "./import";

describe("mapFile", () => {
  // --- Flights: basic mapping ---

  it("maps exact field names for flights", () => {
    const rows = [
      { airline: "Air France", departure_at: "2026-03-28T10:00", arrival_at: "2026-03-28T14:00", route: "LAX → CDG" },
    ];
    const result = mapFile(rows, "flights");
    expect(result.missingRequired).toEqual([]);
    expect(result.mappedRows).toHaveLength(1);
    expect(result.mappedRows[0].airline).toBe("Air France");
    expect(result.mappedRows[0].route).toBe("LAX → CDG");
  });

  it("maps aliases case-insensitively", () => {
    const rows = [
      { Carrier: "Air France", Departure: "2026-03-28T10:00", Arrival: "2026-03-28T14:00", Route: "LAX → CDG" },
    ];
    const result = mapFile(rows, "flights");
    expect(result.missingRequired).toEqual([]);
    expect(result.mappedRows[0].airline).toBe("Air France");
    expect(result.mappedRows[0].departure_at).toBe("2026-03-28T10:00");
  });

  it("maps aliases with extra whitespace", () => {
    const rows = [
      { "  airline  ": "Air France", departure_at: "2026-03-28T10:00", arrival_at: "2026-03-28T14:00", route: "LAX → CDG" },
    ];
    const result = mapFile(rows, "flights");
    expect(result.mappedRows[0].airline).toBe("Air France");
  });

  it("puts unrecognized columns in unmappedColumns", () => {
    const rows = [
      { airline: "Air France", departure_at: "2026-03-28T10:00", arrival_at: "2026-03-28T14:00", route: "LAX → CDG", weird_extra: "junk" },
    ];
    const result = mapFile(rows, "flights");
    expect(result.unmappedColumns).toContain("weird_extra");
    expect(result.mappedRows[0]).not.toHaveProperty("weird_extra");
  });

  it("returns missingRequired when a required field is absent", () => {
    const rows = [
      { airline: "Air France", departure_at: "2026-03-28T10:00", arrival_at: "2026-03-28T14:00" },
    ];
    const result = mapFile(rows, "flights");
    expect(result.missingRequired).toContain("route");
    expect(result.mappedRows).toEqual([]);
  });

  it("returns all missing required fields, not just the first", () => {
    const rows = [{ airline: "Air France" }];
    const result = mapFile(rows, "flights");
    expect(result.missingRequired).toContain("departure_at");
    expect(result.missingRequired).toContain("arrival_at");
    expect(result.missingRequired).toContain("route");
  });

  // --- Auto-excluded fields ---

  it("strips id, created_at, updated_at from mapped output", () => {
    const rows = [
      {
        id: "some-uuid",
        airline: "Air France",
        departure_at: "2026-03-28T10:00",
        arrival_at: "2026-03-28T14:00",
        route: "LAX → CDG",
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    ];
    const result = mapFile(rows, "flights");
    expect(result.mappedRows[0]).not.toHaveProperty("id");
    expect(result.mappedRows[0]).not.toHaveProperty("created_at");
    expect(result.mappedRows[0]).not.toHaveProperty("updated_at");
  });

  // --- Boolean coercion ---

  it('coerces is_private_chef "yes" to true', () => {
    const rows = [{ date: "2026-03-28", cuisine_or_theme: "BBQ", is_private_chef: "yes" }];
    const result = mapFile(rows, "dinners");
    expect(result.mappedRows[0].is_private_chef).toBe(true);
  });

  it('coerces is_private_chef "no" to false', () => {
    const rows = [{ date: "2026-03-28", cuisine_or_theme: "BBQ", is_private_chef: "no" }];
    const result = mapFile(rows, "dinners");
    expect(result.mappedRows[0].is_private_chef).toBe(false);
  });

  it('coerces is_private_chef "1" to true', () => {
    const rows = [{ date: "2026-03-28", cuisine_or_theme: "BBQ", is_private_chef: "1" }];
    const result = mapFile(rows, "dinners");
    expect(result.mappedRows[0].is_private_chef).toBe(true);
  });

  it('coerces is_private_chef "TRUE" (uppercase) to true', () => {
    const rows = [{ date: "2026-03-28", cuisine_or_theme: "BBQ", is_private_chef: "TRUE" }];
    const result = mapFile(rows, "dinners");
    expect(result.mappedRows[0].is_private_chef).toBe(true);
  });

  // --- Priority coercion ---

  it('keeps valid priority "high"', () => {
    const rows = [{ name: "Pont du Gard", location: "Nîmes", priority: "high" }];
    const result = mapFile(rows, "places");
    expect(result.mappedRows[0].priority).toBe("high");
  });

  it("coerces invalid priority to null", () => {
    const rows = [{ name: "Pont du Gard", location: "Nîmes", priority: "urgent" }];
    const result = mapFile(rows, "places");
    expect(result.mappedRows[0].priority).toBeNull();
  });

  it("coerces empty priority to null", () => {
    const rows = [{ name: "Pont du Gard", location: "Nîmes", priority: "" }];
    const result = mapFile(rows, "places");
    expect(result.mappedRows[0].priority).toBeNull();
  });

  // --- Packing: packed optional-with-default ---

  it("injects packed: false when packed column is absent", () => {
    const rows = [{ item: "Passport", category: "documents" }];
    const result = mapFile(rows, "packing");
    expect(result.missingRequired).toEqual([]);
    expect(result.mappedRows[0].packed).toBe(false);
  });

  it('coerces packed "true" to true when column is present', () => {
    const rows = [{ item: "Passport", category: "documents", packed: "true" }];
    const result = mapFile(rows, "packing");
    expect(result.mappedRows[0].packed).toBe(true);
  });

  // --- Edge cases ---

  it("handles empty rows array", () => {
    const result = mapFile([], "flights");
    expect(result.mappedRows).toEqual([]);
    expect(result.unmappedColumns).toEqual([]);
    expect(result.missingRequired).toEqual([]);
  });

  it("maps multiple rows correctly", () => {
    const rows = [
      { airline: "Air France", departure_at: "2026-03-28T10:00", arrival_at: "2026-03-28T14:00", route: "LAX → CDG" },
      { airline: "EasyJet", departure_at: "2026-04-04T09:00", arrival_at: "2026-04-04T11:00", route: "MRS → LHR" },
    ];
    const result = mapFile(rows, "flights");
    expect(result.mappedRows).toHaveLength(2);
    expect(result.mappedRows[1].airline).toBe("EasyJet");
  });
});
