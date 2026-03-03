"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const { theme, setTheme, systemTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<button className="absolute top-20 right-4 p-2 bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border border-border z-10">
				<div className="w-5 h-5" />
			</button>
		);
	}

	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";

	return (
		<button
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="absolute top-20 right-4 p-2 bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border border-border hover:bg-card transition-colors z-10"
			aria-label="Toggle theme"
		>
			{isDark ? (
				<Sun className="w-5 h-5 text-foreground" />
			) : (
				<Moon className="w-5 h-5 text-foreground" />
			)}
		</button>
	);
}
