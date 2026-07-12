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
			<button
				type="button"
				disabled
				aria-label="Toggle theme"
				className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-card/70 text-muted-foreground"
			>
				<span className="h-5 w-5" />
			</button>
		);
	}

	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";

	return (
		<button
			type="button"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			aria-label="Toggle theme"
			className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-card/70 text-foreground transition-colors hover:bg-card"
		>
			{isDark ? (
				<Sun className="h-5 w-5" aria-hidden="true" />
			) : (
				<Moon className="h-5 w-5" aria-hidden="true" />
			)}
		</button>
	);
}

