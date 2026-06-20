"use client";

import { ChevronRight } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { cn } from "../lib/utils";
import { HapticButton } from "./haptic-button";

/**
 * A presentational menu row: leading icon + label + optional trailing value + a
 * chevron. Compose your settings views (slippage, order type, language, fees …)
 * from these so they share the exact look — strings + formatting are yours.
 */
export function SettingsRow({
	icon: Icon,
	label,
	value,
	onClick,
	className,
}: {
	icon?: ComponentType<{ className?: string }>;
	label: ReactNode;
	value?: ReactNode;
	onClick?: () => void;
	className?: string;
}) {
	return (
		<HapticButton
			type="button"
			onClick={onClick}
			wrapperClassName="block w-full"
			className={cn(
				"flex h-12 w-full cursor-pointer items-center gap-3 rounded-full bg-foreground/[0.06] px-4 text-left transition-colors hover:bg-foreground/10",
				className,
			)}
		>
			{Icon && <Icon className="size-5 shrink-0 text-muted-foreground" />}
			<span className="flex-1 truncate text-base font-medium text-foreground">{label}</span>
			{value != null && (
				<span className="shrink-0 text-muted-foreground tabular-nums">{value}</span>
			)}
			<ChevronRight className="size-5 shrink-0 text-muted-foreground" />
		</HapticButton>
	);
}
