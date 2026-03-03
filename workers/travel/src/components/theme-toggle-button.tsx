"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type ThemeToggleButtonProps = {
	variant?: "circle" | "rectangle" | "gif";
	blur?: boolean;
	start?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
};

export function ThemeToggleButton({
	variant = "circle",
	blur = true,
	start = "top-right",
}: ThemeToggleButtonProps) {
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

	const getStartPosition = () => {
		switch (start) {
			case "top-left":
				return { top: "0%", left: "0%" };
			case "top-right":
				return { top: "0%", right: "0%" };
			case "bottom-left":
				return { bottom: "0%", left: "0%" };
			case "bottom-right":
				return { bottom: "0%", right: "0%" };
			case "center":
			default:
				return { top: "50%", left: "50%" };
		}
	};

	const toggleTheme = async () => {
		// Check if View Transition API is supported
		if (!document.startViewTransition) {
			setTheme(isDark ? "light" : "dark");
			return;
		}

		const transition = document.startViewTransition(async () => {
			setTheme(isDark ? "light" : "dark");
		});

		if (variant === "circle") {
			const startPos = getStartPosition();

			transition.ready.then(() => {
				// Calculate the maximum distance from the start position to any corner
				const x = startPos.left ? 0 : startPos.right ? window.innerWidth : window.innerWidth / 2;
				const y = startPos.top ? 0 : startPos.bottom ? window.innerHeight : window.innerHeight / 2;

				const endRadius = Math.hypot(
					Math.max(x, window.innerWidth - x),
					Math.max(y, window.innerHeight - y)
				);

				// Create the circular clip path animation
				const clipPath = [
					`circle(0px at ${x}px ${y}px)`,
					`circle(${endRadius}px at ${x}px ${y}px)`,
				];

				document.documentElement.animate(
					{
						clipPath: isDark ? clipPath : clipPath.reverse(),
					},
					{
						duration: 500,
						easing: "ease-in-out",
						pseudoElement: isDark ? "::view-transition-new(root)" : "::view-transition-old(root)",
					}
				);
			});
		}
	};

	const buttonPositionClass = start === "top-right"
		? "absolute top-20 right-4"
		: start === "top-left"
		? "absolute top-20 left-4"
		: start === "bottom-right"
		? "absolute bottom-4 right-4"
		: start === "bottom-left"
		? "absolute bottom-4 left-4"
		: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";

	const blurClass = blur ? "backdrop-blur-sm" : "";

	return (
		<button
			onClick={toggleTheme}
			className={`${buttonPositionClass} p-2 bg-card/80 ${blurClass} rounded-lg shadow-lg border border-border hover:bg-card transition-colors z-10`}
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

export function useThemeToggle({
	variant = "circle",
	start = "center",
}: {
	variant?: "circle" | "rectangle" | "gif";
	start?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "bottom-up";
}) {
	const { theme, setTheme, systemTheme } = useTheme();
	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";

	const getStartPosition = () => {
		switch (start) {
			case "top-left":
				return { top: "0%", left: "0%" };
			case "top-right":
				return { top: "0%", right: "0%" };
			case "bottom-left":
				return { bottom: "0%", left: "0%" };
			case "bottom-right":
				return { bottom: "0%", right: "0%" };
			case "bottom-up":
				return { bottom: "0%", left: "50%" };
			case "center":
			default:
				return { top: "50%", left: "50%" };
		}
	};

	const toggleTheme = async () => {
		if (!document.startViewTransition) {
			setTheme(isDark ? "light" : "dark");
			return;
		}

		const transition = document.startViewTransition(async () => {
			setTheme(isDark ? "light" : "dark");
		});

		if (variant === "circle") {
			const startPos = getStartPosition();

			transition.ready.then(() => {
				const x = startPos.left ? 0 : startPos.right ? window.innerWidth : window.innerWidth / 2;
				const y = startPos.top ? 0 : startPos.bottom ? window.innerHeight : window.innerHeight / 2;

				const endRadius = Math.hypot(
					Math.max(x, window.innerWidth - x),
					Math.max(y, window.innerHeight - y)
				);

				const clipPath = [
					`circle(0px at ${x}px ${y}px)`,
					`circle(${endRadius}px at ${x}px ${y}px)`,
				];

				document.documentElement.animate(
					{
						clipPath: isDark ? clipPath : clipPath.reverse(),
					},
					{
						duration: 500,
						easing: "ease-in-out",
						pseudoElement: isDark ? "::view-transition-new(root)" : "::view-transition-old(root)",
					}
				);
			});
		}
	};

	return {
		isDark,
		theme: currentTheme,
		toggleTheme,
	};
}
