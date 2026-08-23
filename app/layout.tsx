import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "D'BHERUNK Cafe System | Modern POS & Management",
  description: "High-performance POS, Inventory, and Kitchen Display System for D'BHERUNK Cafe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas text-ink antialiased selection:bg-primary selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
