import { ThemeProvider } from 'next-themes'
import { Nunito } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const title = "Memo — Joe Blau";
const description = "Memos on markets, infrastructure, and the systems behind them.";

export const metadata: Metadata = {
  metadataBase: new URL("https://memo.joeblau.com"),
  title: {
    default: title,
    template: "%s",
  },
  description,
  openGraph: {
    title,
    description,
    url: "https://memo.joeblau.com",
    siteName: "Memo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
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
