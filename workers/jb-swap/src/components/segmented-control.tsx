"use client";

import { motion } from "framer-motion";
import type { ComponentType } from "react";

import { HapticButton } from "@/components/haptic-button";
import { cn } from "@/lib/utils";

/**
 * Generic icon + label segmented control. A single pill slides between segments
 * via a shared `layoutId` (must be unique per instance on the page). Mirrors the
 * look of ThemeSegmentedControl so menu rows stay visually consistent.
 */
export interface SegmentOption<T extends string> {
	value: T;
	label: string;
	icon: ComponentType<{ className?: string }>;
}

export function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
	layoutId,
	className,
}: {
	options: SegmentOption<T>[];
	value: T;
	onChange: (value: T) => void;
	/** Unique id for the sliding pill's shared layout animation. */
	layoutId: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-1 rounded-full bg-foreground/[0.06] p-1",
				className,
			)}
		>
			{options.map(({ value: optionValue, label, icon: Icon }) => {
				const isActive = value === optionValue;
				return (
					<HapticButton
						key={optionValue}
						type="button"
						wrapperClassName="grid flex-1"
						onClick={() => onChange(optionValue)}
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
								layoutId={layoutId}
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
