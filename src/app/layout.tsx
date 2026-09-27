import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inventory SaaS",
  description: "Multi-tenant inventory management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
