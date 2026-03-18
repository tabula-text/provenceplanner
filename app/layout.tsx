import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Provence Planner",
  description: "Trip planning app for Southern France vacation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950">
        {children}
      </body>
    </html>
  );
}
