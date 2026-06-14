"use client";

import { motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { HapticButton } from "@/components/haptic-button";
import { useThemeToggle } from "@/components/skiper26";
import { cn } from "@/lib/utils";

type ThemeOption = "system" | "light" | "dark";

const OPTIONS: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
	{ value: "system", label: "System", icon: Monitor },
	{ value: "light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
];

/**
 * System / Light / Dark segmented control. A single pill slides between the
 * three segments via a shared `layoutId`, while each tap runs the skiper26
 * View-Transition theme swap so the whole page wipes to the chosen theme.
 */
export function ThemeSegmentedControl({ className }: { className?: string }) {
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
		<div
			className={cn(
				"flex items-center gap-1 rounded-full bg-foreground/[0.06] p-1",
				className,
			)}
		>
			{OPTIONS.map(({ value, label, icon: Icon }) => {
				const isActive = active === value;
				return (
					<HapticButton
						key={value}
						type="button"
						wrapperClassName="grid flex-1"
						onClick={() => select(value)}
						aria-pressed={isActive}
						className={cn(
							"relative flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium transition-colors",
							isActive
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{isActive && (
							<motion.span
								layoutId="theme-segment-pill"
								className="absolute inset-0 rounded-full bg-background shadow-sm"
								transition={{ type: "spring", stiffness: 400, damping: 32 }}
							/>
						)}
						<span className="relative flex items-center gap-2">
							<Icon className="size-4" />
							{label}
						</span>
					</HapticButton>
				);
			})}
		</div>
	);
}
