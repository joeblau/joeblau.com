import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F1 · Joe Blau",
  description: "Joe Blau’s corner of Formula 1.",
  metadataBase: new URL("https://f1.joeblau.com"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
