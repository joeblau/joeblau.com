import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "Travel Globe",
		template: "%s | Travel Globe"
	},
	description: "Interactive 3D globe for tracking and exploring travel locations around the world with real-time day/night visualization",
	keywords: ["travel", "globe", "map", "locations", "world", "geography", "travel tracker", "interactive map"],
	authors: [{ name: "Joe Blau" }],
	creator: "Joe Blau",
	metadataBase: new URL("https://travel.joeblau.com"),
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://travel.joeblau.com",
		title: "Travel Globe",
		description: "Interactive 3D globe for tracking and exploring travel locations around the world",
		siteName: "Travel Globe",
		images: [
			{
				url: "/api/og-globe",
				width: 1200,
				height: 630,
				alt: "Travel Globe - Interactive World Map"
			}
		]
	},
	twitter: {
		card: "summary_large_image",
		title: "Travel Globe",
		description: "Interactive 3D globe for tracking and exploring travel locations around the world",
		creator: "@joeblau",
		images: ["/api/og-globe"]
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1
		}
	},
	icons: {
		icon: "/favicon.svg",
		shortcut: "/favicon.svg",
		apple: "/favicon.svg"
	},
	manifest: "/site.webmanifest"
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: "cover",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#000000" }
	]
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="overflow-hidden" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
