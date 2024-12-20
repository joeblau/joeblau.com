import { ThemeProvider } from 'next-themes'
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Joe Blau",
  description: "Founder • Investor",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://joeblau.com",
    title: "Joe Blau",
    description: "Founder • Investor",
    images: [
      {
        url: "https://joeblau.com/og.png",
        width: 1200,
        height: 600,
        alt: "Joe Blau",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
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
