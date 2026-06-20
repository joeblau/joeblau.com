"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import type { MenuSlotApi } from "../types";
import { BottomSheet, SheetHeader } from "./bottom-sheet";
import { HapticButton } from "./haptic-button";
import { ResizablePanel } from "./resizable-panel";

/**
 * The presentational shell of the settings menu: the size-12 circular trigger
 * (matching the reset button), the bottom sheet, the back/title/close header,
 * and the morphing ResizablePanel view host. The per-view CONTENT is your
 * `renderMenu` render prop — switch on `api.view` and push sub-views with
 * `api.setView`. Titles come from the `titles` map.
 */
export function AppMenuShell({
	renderMenu,
	titles = {},
	initialView = "root",
	menuAriaLabel = "Menu",
	backAriaLabel,
	closeAriaLabel,
}: {
	renderMenu?: (api: MenuSlotApi) => React.ReactNode;
	titles?: Record<string, string>;
	initialView?: string;
	menuAriaLabel?: string;
	backAriaLabel?: string;
	closeAriaLabel?: string;
}) {
	const [open, setOpen] = useState(false);
	const [view, setViewState] = useState(initialView);
	const [direction, setDirection] = useState(1);

	const setView = (next: string, dir = 1) => {
		setDirection(dir);
		setViewState(next);
	};

	const onOpenChange = (next: boolean) => {
		setOpen(next);
		// Reset back to the root view once the sheet has closed.
		if (!next) {
			setDirection(-1);
			setViewState(initialView);
		}
	};

	const trigger = (
		<HapticButton
			type="button"
			onClick={() => setOpen(true)}
			aria-label={menuAriaLabel}
			className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80 active:scale-95"
		>
			<Menu className="size-5" />
		</HapticButton>
	);

	return (
		<BottomSheet open={open} onOpenChange={onOpenChange} trigger={trigger}>
			<div className="flex flex-col gap-4 px-3 pb-8 pt-4">
				<SheetHeader
					title={titles[view] ?? ""}
					onBack={view !== initialView ? () => setView(initialView, -1) : undefined}
					backAriaLabel={backAriaLabel}
					closeAriaLabel={closeAriaLabel}
				/>
				<ResizablePanel activeKey={view} direction={direction}>
					{renderMenu?.({ view, setView, close: () => onOpenChange(false) }) ?? null}
				</ResizablePanel>
			</div>
		</BottomSheet>
	);
}
