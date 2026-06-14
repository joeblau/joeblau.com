import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const nunito = Nunito({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
	title: "Swap — Joe Blau",
	description: "Swap",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://swap.joeblau.com",
		title: "Swap — Joe Blau",
		description: "Swap",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${nunito.className} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
