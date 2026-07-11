import { ThemeProvider } from 'next-themes'
import { Nunito } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DEXos — A 24/7 Global Trading Operating System",
  description:
    "The next evolution of capital markets: a truly 24/7, globally decentralized, high-performance trading operating system.",
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
