"use client";

import { ChevronLeft, Coins, DollarSign, Menu, X } from "lucide-react";
import { useRef, useState } from "react";
import { Drawer } from "vaul";

import { LanguagePanel, LanguageRow } from "@/components/language-drawer";
import { ResizablePanel } from "@/components/resizable-panel";
import {
	SegmentedControl,
	type SegmentOption,
} from "@/components/segmented-control";
import {
	FeeBreakdownPanel,
	FeeBreakdownRow,
	OrderPanel,
	OrderRow,
	type OrderType,
	SlippageControls,
	SlippageRow,
} from "@/components/settings-panels";
import { ThemeSegmentedControl } from "@/components/theme-segmented-control";
import { useLocale, useTranslations } from "@/i18n/locale-provider";
import type { NormalizedQuoteFees } from "@/lib/relay";
import { cn } from "@/lib/utils";

type View = "menu" | "language" | "order" | "slippage" | "fees";

export type Denomination = "usd" | "units";

/** localStorage key for the default amount denomination. */
export const DENOMINATION_KEY = "jbswap:denomination";

const DENOMINATION_OPTIONS: SegmentOption<Denomination>[] = [
	{ value: "usd", label: "Dollars", icon: DollarSign },
	{ value: "units", label: "Units", icon: Coins },
];

/**
 * Bottom-row menu button. Opens a Vaul bottom-sheet (matching the token /
 * slippage drawers) that holds the theme control, language picker, and is the
 * home for future options. Selecting Language pushes a new view into the SAME
 * sheet; the body springs its height and slides between views — a Family-wallet
 * style morph rather than a hard snap.
 */
export function AppMenu({
	className,
	denomination,
	onDenominationChange,
	orderType,
	onOrderTypeChange,
	slippage,
	onSlippageChange,
	fees,
	feeLoading,
}: {
	className?: string;
	denomination: Denomination;
	onDenominationChange: (value: Denomination) => void;
	/** Order type (market | limit) + its setter. */
	orderType: OrderType;
	onOrderTypeChange: (value: OrderType) => void;
	/** Slippage tolerance (fraction, e.g. 0.005 = 0.5%) + its setter. */
	slippage: number;
	onSlippageChange: (value: number) => void;
	/** Live quote fee breakdown (null until a quote resolves). */
	fees: NormalizedQuoteFees | null;
	feeLoading?: boolean;
}) {
	const t = useTranslations();
	const { locale, setLocale } = useLocale();
	const [view, setView] = useState<View>("menu");
	// +1 = forward push (slide in from the right), -1 = back pop.
	const [direction, setDirection] = useState(1);
	const directionRef = useRef(1);

	const go = (next: View) => {
		const dir = next === "menu" ? -1 : 1;
		directionRef.current = dir;
		setDirection(dir);
		setView(next);
	};

	return (
		<Drawer.Root
			onOpenChange={(open) => {
				// Reset to the menu view once the sheet finishes closing.
				if (!open) {
					directionRef.current = 1;
					setDirection(1);
					setView("menu");
				}
			}}
		>
			<Drawer.Trigger asChild>
				<button
					type="button"
					aria-label={t("menu.triggerAriaLabel")}
					className={cn(
						"flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80 active:scale-95",
						className,
					)}
				>
					<Menu className="size-5" />
				</button>
			</Drawer.Trigger>
			<Drawer.Portal>
				<Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
				<Drawer.Content
					aria-describedby={undefined}
					className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md flex-col rounded-t-3xl bg-card outline-none"
				>
					<div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-foreground/20" />

					<div className="flex flex-col gap-4 px-3 pb-8 pt-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1">
								{view !== "menu" && (
									<button
										type="button"
										aria-label={t("menu.backAriaLabel")}
										onClick={() => go("menu")}
										className="-ml-2 flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
									>
										<ChevronLeft className="size-6" />
									</button>
								)}
								<Drawer.Title className="text-2xl font-bold text-foreground">
									{view === "language"
										? t("menu.titleLanguage")
										: view === "order"
											? t("menu.order")
											: view === "slippage"
												? t("slippage.title")
												: view === "fees"
													? t("menu.feeBreakdown")
													: t("menu.titleMenu")}
								</Drawer.Title>
							</div>
							<Drawer.Close className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-foreground/10 text-muted-foreground transition-colors hover:bg-foreground/15">
								<X className="size-5" />
							</Drawer.Close>
						</div>

						<ResizablePanel activeKey={view} direction={direction}>
							{view === "language" ? (
								<LanguagePanel
									value={locale}
									onSelect={(code) => {
										setLocale(code);
										go("menu");
									}}
								/>
							) : view === "order" ? (
								<OrderPanel
									value={orderType}
									onSelect={(next) => {
										onOrderTypeChange(next);
										go("menu");
									}}
								/>
							) : view === "slippage" ? (
								<SlippageControls value={slippage} onChange={onSlippageChange} />
							) : view === "fees" ? (
								<FeeBreakdownPanel fees={fees} loading={feeLoading} />
							) : (
								<div className="flex flex-col gap-4">
									<LanguageRow
										value={locale}
										onOpen={() => go("language")}
									/>
									<ThemeSegmentedControl />
									<SegmentedControl
										options={DENOMINATION_OPTIONS.map((option) => ({
											...option,
											label:
												option.value === "usd"
													? t("menu.denominationDollars")
													: t("menu.denominationUnits"),
										}))}
										value={denomination}
										onChange={onDenominationChange}
										layoutId="denomination-segment-pill"
									/>
									<div className="flex flex-col gap-2">
										<h3 className="px-2 pt-1 text-sm font-semibold text-muted-foreground">
											{t("menu.sectionTransaction")}
										</h3>
										<OrderRow
											value={orderType}
											onOpen={() => go("order")}
										/>
										<SlippageRow
											value={slippage}
											onOpen={() => go("slippage")}
										/>
										<FeeBreakdownRow
											total={fees?.totalUsd ?? null}
											loading={feeLoading}
											onOpen={() => go("fees")}
										/>
									</div>
								</div>
							)}
						</ResizablePanel>
					</div>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
