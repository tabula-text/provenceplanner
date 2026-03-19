"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-screen w-64 flex-col border-r"
      style={{
        backgroundColor: "var(--color-stone-800)",
        borderColor: "var(--color-stone-700)",
      }}
    >
      {/* Header */}
      <div
        className="border-b p-6"
        style={{ borderColor: "var(--color-stone-700)" }}
      >
        <p className="section-label">Provence</p>
        <h2
          className="font-display mt-1 text-2xl font-semibold"
          style={{ color: "var(--color-cream-100)" }}
        >
          Planner
        </h2>
        <p className="mt-1 text-xs" style={{ color: "var(--color-cream-500)" }}>
          15–22 May 2024
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  style={
                    isActive
                      ? {
                          backgroundColor: "rgba(196, 98, 45, 0.10)",
                          color: "var(--color-saffron)",
                          borderLeft: "2px solid var(--color-terracotta)",
                          paddingLeft: "10px",
                        }
                      : {
                          color: "var(--color-cream-300)",
                        }
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div
        className="border-t p-4"
        style={{ borderColor: "var(--color-stone-700)" }}
      >
        <button
          onClick={() => {
            window.location.href = "/api/auth/logout";
          }}
          className="btn-secondary w-full"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
