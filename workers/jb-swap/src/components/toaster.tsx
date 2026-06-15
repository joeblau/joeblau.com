"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

/**
 * App toaster — top-center, following the resolved light/dark theme so toasts
 * match the surrounding surfaces. Mounted once in the root layout.
 */
export function Toaster() {
	const { resolvedTheme } = useTheme();
	return (
		<SonnerToaster
			position="top-center"
			theme={resolvedTheme === "dark" ? "dark" : "light"}
		/>
	);
}
