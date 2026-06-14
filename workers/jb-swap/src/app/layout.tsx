import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { WalletProvider } from "@/components/wallet-provider";
import { LocaleProvider } from "@/i18n/locale-provider";

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
			<head>
				{/* Per-locale display fonts (applied via [data-locale] in globals.css):
				    Chinese → M PLUS Rounded 1c, Korean → Chiron GoRound TC. Loaded from
				    Google Fonts so its unicode-range subsetting only fetches the CJK
				    glyph chunks actually used. */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Chiron+GoRound+TC:wght@400;500;700&family=M+PLUS+Rounded+1c:wght@400;500;700&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className={`${nunito.className} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<WalletProvider>
						<LocaleProvider>{children}</LocaleProvider>
					</WalletProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
