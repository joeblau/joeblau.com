"use client";

import { RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../lib/utils";
import { HapticButton } from "./haptic-button";

/**
 * The action row: a left `menu` slot (e.g. <AppMenuShell/>), the primary CTA
 * (fills remaining width), and a circular reset button on the right. The menu
 * and reset are visually identical size-12 bookends. Used internally by
 * SwapCard; exported for bespoke layouts.
 */
export function ActionRow({
	menu,
	actionLabel,
	onSubmit,
	submitDisabled,
	submitting,
	submitConfirming = "Confirming…",
	onReset,
	resetDisabled,
	resetAriaLabel = "Reset",
	className,
}: {
	menu?: ReactNode;
	actionLabel: ReactNode;
	onSubmit?: () => void;
	submitDisabled?: boolean;
	submitting?: boolean;
	submitConfirming?: string;
	onReset?: () => void;
	resetDisabled?: boolean;
	resetAriaLabel?: string;
	className?: string;
}) {
	return (
		<div className={cn("mt-2 flex items-center gap-2", className)}>
			{menu}
			<HapticButton
				wrapperClassName="grid flex-1"
				type="button"
				onClick={onSubmit}
				disabled={submitDisabled}
				className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-secondary/40 disabled:text-muted-foreground disabled:hover:bg-secondary/40 disabled:active:scale-100"
			>
				{submitting ? submitConfirming : actionLabel}
			</HapticButton>
			<HapticButton
				type="button"
				onClick={onReset}
				disabled={resetDisabled}
				aria-label={resetAriaLabel}
				className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80 active:scale-95 disabled:cursor-not-allowed disabled:bg-secondary/40 disabled:text-muted-foreground disabled:hover:bg-secondary/40 disabled:active:scale-100"
			>
				<RotateCcw className="size-5" />
			</HapticButton>
		</div>
	);
}
