"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { theme, setTheme, systemTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button variant="outline" size="icon" disabled>
				<div className="h-5 w-5" />
			</Button>
		);
	}

	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";

	return (
		<Button
			variant="outline"
			size="icon"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			aria-label="Toggle theme"
		>
			{isDark ? (
				<Sun className="h-5 w-5" />
			) : (
				<Moon className="h-5 w-5" />
			)}
		</Button>
	);
}
