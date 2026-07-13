import { ThemeProvider } from 'next-themes'
import { Nunito } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const title = "DEXos — A 24/7 Global Trading Operating System";
const description =
  "The next evolution of capital markets: a truly 24/7, globally decentralized, high-performance trading operating system.";

export const metadata: Metadata = {
  metadataBase: new URL("https://dexos.joeblau.com"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://dexos.joeblau.com",
    siteName: "DEXos",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "DEXos" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/api/og"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={nunito.variable}>
      <body className="font-[family-name:var(--font-nunito)] antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
