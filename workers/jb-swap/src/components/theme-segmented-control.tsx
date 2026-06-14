"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import {
	SegmentedControl,
	type SegmentOption,
} from "@/components/segmented-control";
import { useThemeToggle } from "@/components/skiper26";
import { useTranslations } from "@/i18n/locale-provider";

type ThemeOption = "system" | "light" | "dark";

const OPTIONS: (Omit<SegmentOption<ThemeOption>, "label"> & {
	labelKey: string;
})[] = [
	{ value: "system", labelKey: "theme.system", icon: Monitor },
	{ value: "light", labelKey: "theme.light", icon: Sun },
	{ value: "dark", labelKey: "theme.dark", icon: Moon },
];

/**
 * System / Light / Dark segmented control. Renders the shared SegmentedControl
 * (so it stays visually identical to the other menu segments), while each tap
 * runs the skiper26 View-Transition theme swap so the whole page wipes to the
 * chosen theme.
 */
export function ThemeSegmentedControl({ className }: { className?: string }) {
	const t = useTranslations();
	const { theme } = useTheme();
	const { setCrazySystemTheme, setCrazyLightTheme, setCrazyDarkTheme } =
		useThemeToggle({ variant: "circle", start: "center", blur: true });

	// next-themes is undefined until hydration; gate the active pill on mount so
	// SSR and the first client paint agree.
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const active = (mounted ? theme : "system") as ThemeOption;

	const select = (value: ThemeOption) => {
		if (value === "system") setCrazySystemTheme();
		else if (value === "light") setCrazyLightTheme();
		else setCrazyDarkTheme();
	};

	return (
		<SegmentedControl
			options={OPTIONS.map(({ labelKey, ...option }) => ({
				...option,
				label: t(labelKey),
			}))}
			value={active}
			onChange={select}
			layoutId="theme-segment-pill"
			className={className}
		/>
	);
}
