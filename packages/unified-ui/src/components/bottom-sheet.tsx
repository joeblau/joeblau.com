"use client";

import { ChevronLeft, X } from "lucide-react";
import type { ReactNode } from "react";
import { Drawer } from "vaul";

import { cn } from "../lib/utils";

/**
 * Controlled bottom sheet — the byte-identical vaul chrome (overlay, rounded-top
 * card content, drag handle) shared by the token picker and the settings menu.
 * Render your `trigger` (it opens the sheet via its own handler) and the body as
 * `children`. The body layout (header, scroll area, padding) is yours; use
 * <SheetHeader/> for the standard header. Set `contentClassName` to size the
 * sheet (e.g. "h-[88vh]" for a tall scrolling drawer).
 */
export function BottomSheet({
	open,
	onOpenChange,
	trigger,
	children,
	contentClassName,
	showHandle = true,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	trigger?: ReactNode;
	children: ReactNode;
	contentClassName?: string;
	showHandle?: boolean;
}) {
	return (
		<Drawer.Root open={open} onOpenChange={onOpenChange}>
			{trigger}
			<Drawer.Portal>
				<Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
				<Drawer.Content
					aria-describedby={undefined}
					className={cn(
						"fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md flex-col rounded-t-3xl bg-card outline-none",
						contentClassName,
					)}
				>
					{showHandle && (
						<div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-foreground/20" />
					)}
					{children}
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
}

/**
 * Standard sheet header row: an optional back button, a title, and a close
 * button. Must render inside a <BottomSheet/> (uses vaul's Title/Close). Carries
 * no outer padding — place it inside your padded body container.
 */
export function SheetHeader({
	title,
	onBack,
	backAriaLabel = "Back",
	closeAriaLabel = "Close",
}: {
	title: ReactNode;
	onBack?: () => void;
	backAriaLabel?: string;
	closeAriaLabel?: string;
}) {
	return (
		<div className="flex items-center justify-between gap-2">
			<div className="flex min-w-0 items-center gap-1">
				{onBack && (
					<button
						type="button"
						onClick={onBack}
						aria-label={backAriaLabel}
						className="-ml-2 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
					>
						<ChevronLeft className="size-6" />
					</button>
				)}
				<Drawer.Title className="truncate text-2xl font-bold text-foreground">
					{title}
				</Drawer.Title>
			</div>
			<Drawer.Close
				aria-label={closeAriaLabel}
				className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-foreground/10 text-muted-foreground transition-colors hover:bg-foreground/15"
			>
				<X className="size-5" />
			</Drawer.Close>
		</div>
	);
}
