"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid password");
        return;
      }

      router.push("/calendar");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "var(--color-stone-900)" }}
    >
      <div className="w-full max-w-sm px-4">
        {/* Card */}
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            backgroundColor: "var(--color-cream-900)",
            border: "1px solid var(--color-stone-700)",
          }}
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <h1
              className="font-display text-4xl font-semibold"
              style={{ color: "var(--color-cream-100)" }}
            >
              Provence Planner
            </h1>
            <p
              className="section-label mt-2"
            >
              May 2024 · Southern France
            </p>
            <hr
              className="mt-4"
              style={{ borderColor: "var(--color-stone-700)" }}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--color-cream-300)" }}
              >
                Trip Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter trip password"
                className="form-input"
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div
                className="rounded-lg p-3 text-sm"
                style={{
                  backgroundColor: "rgba(196, 98, 45, 0.1)",
                  color: "var(--color-terracotta)",
                  border: "1px solid var(--color-terracotta-dim)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn w-full disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Enter"}
            </button>
          </form>
        </div>

        {/* Tagline */}
        <p
          className="font-display mt-6 text-center text-lg italic"
          style={{ color: "var(--color-cream-500)" }}
        >
          Une famille en Provence
        </p>
      </div>
    </div>
  );
}
