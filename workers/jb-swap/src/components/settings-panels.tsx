"use client";

import NumberFlow from "@number-flow/react";
import { ChevronRight, Receipt, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { HapticButton } from "@/components/haptic-button";
import { Keypad } from "@/components/keypad";
import { useTranslations } from "@/i18n/locale-provider";
import type { NormalizedQuoteFees } from "@/lib/relay";
import { cn } from "@/lib/utils";

/**
 * Settings pieces pushed into the AppMenu sheet (mirroring the language
 * row/panel): an adjustable Slippage panel and a read-only Fee Breakdown.
 * Both surface as a tappable row in the menu that swaps the sheet's content.
 */

/** Slippage presets as fractions: 0.1% / 0.5% / 1.0%. */
export const SLIPPAGE_PRESETS = [0.001, 0.005, 0.01];

/** Format a fraction as a percent string with trailing zeros trimmed. */
export function formatPct(fraction: number) {
	return `${Number((fraction * 100).toFixed(4))}%`;
}

const fmtUsd = (n: number) => `$${n.toFixed(2)}`;

/** Shared menu-row look: icon + label + current value + chevron. */
function SettingsRow({
	icon: Icon,
	label,
	value,
	onOpen,
}: {
	icon: typeof SlidersHorizontal;
	label: string;
	value: string;
	onOpen: () => void;
}) {
	return (
		<HapticButton
			type="button"
			onClick={onOpen}
			wrapperClassName="block w-full"
			className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-full bg-foreground/[0.06] px-4 text-left text-base font-medium text-foreground transition-colors hover:bg-foreground/10"
		>
			<Icon className="size-5 shrink-0 text-muted-foreground" />
			<span className="flex-1">{label}</span>
			<span className="text-muted-foreground tabular-nums">{value}</span>
			<ChevronRight className="size-5 shrink-0 text-muted-foreground" />
		</HapticButton>
	);
}

/** Menu row that opens the slippage panel; shows the current tolerance. */
export function SlippageRow({
	value,
	onOpen,
}: {
	value: number;
	onOpen: () => void;
}) {
	const t = useTranslations();
	return (
		<SettingsRow
			icon={SlidersHorizontal}
			label={t("slippage.title")}
			value={formatPct(value)}
			onOpen={onOpen}
		/>
	);
}

/** Menu row that opens the fee breakdown; shows the current total fee. */
export function FeeBreakdownRow({
	total,
	loading,
	onOpen,
}: {
	total: number | null;
	loading?: boolean;
	onOpen: () => void;
}) {
	const t = useTranslations();
	const value = loading ? "…" : total != null ? fmtUsd(total) : "—";
	return (
		<SettingsRow
			icon={Receipt}
			label={t("menu.feeBreakdown")}
			value={value}
			onOpen={onOpen}
		/>
	);
}

/** Value (fraction) as a trimmed percent string, e.g. 0.005 -> "0.5". */
const pctString = (fraction: number) =>
	String(Number((fraction * 100).toFixed(4)));

/**
 * The pushed-in slippage view: preset chips + a custom value shown with
 * NumberFlow and entered via the in-app numpad (no device keyboard). The
 * editable `%` string is local; presets and keypad both keep it in sync with
 * the parent's fraction `value`.
 */
export function SlippageControls({
	value,
	onChange,
}: {
	value: number;
	onChange: (v: number) => void;
}) {
	const [input, setInput] = useState(() => pctString(value));

	const commit = (next: string) => {
		setInput(next);
		const pct = Number.parseFloat(next);
		onChange(Number.isFinite(pct) && pct >= 0 ? pct / 100 : 0);
	};

	const selectPreset = (preset: number) => {
		setInput(pctString(preset));
		onChange(preset);
	};

	const handleKey = (key: string) => {
		if (key === "back") {
			commit(input.length > 1 ? input.slice(0, -1) : "0");
			return;
		}
		if (key === ".") {
			if (!input.includes(".")) commit(`${input}.`);
			return;
		}
		commit(input === "0" ? key : input + key);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex gap-2">
				{SLIPPAGE_PRESETS.map((preset) => {
					const active = Math.abs(value - preset) < 1e-9;
					return (
						<button
							key={preset}
							type="button"
							onClick={() => selectPreset(preset)}
							className={cn(
								"flex flex-1 cursor-pointer items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
								active
									? "bg-foreground text-background"
									: "bg-foreground/[0.06] text-foreground hover:bg-foreground/10",
							)}
						>
							{formatPct(preset)}
						</button>
					);
				})}
			</div>
			{/* NumberFlow display — no <input>, so the device keyboard never opens. */}
			<div className="flex items-center justify-center rounded-2xl bg-foreground/[0.06] px-4 py-5 text-4xl font-bold tabular-nums text-foreground">
				<NumberFlow
					value={Number(input) || 0}
					suffix={input.endsWith(".") ? "." : ""}
					format={{ maximumFractionDigits: 4, useGrouping: false }}
				/>
				<span>%</span>
			</div>
			<Keypad onKey={handleKey} />
		</div>
	);
}

/** The pushed-in fee-breakdown view: read-only network / relayer / app / total. */
export function FeeBreakdownPanel({
	fees,
	loading,
}: {
	fees: NormalizedQuoteFees | null;
	loading?: boolean;
}) {
	const t = useTranslations();
	if (!fees) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				{loading ? "…" : t("swapCard.actionLabel.enterAmount")}
			</p>
		);
	}
	const rows = [
		{ label: t("fees.network"), value: fmtUsd(fees.gasUsd) },
		{ label: t("fees.relayer"), value: fmtUsd(fees.relayerUsd) },
		...(fees.appUsd > 0
			? [{ label: t("fees.app"), value: fmtUsd(fees.appUsd) }]
			: []),
	];
	return (
		<div className="flex flex-col divide-y divide-foreground/[0.06] rounded-2xl bg-foreground/[0.04] px-4">
			{rows.map((r) => (
				<div key={r.label} className="flex items-center justify-between py-3">
					<span className="text-base text-muted-foreground">{r.label}</span>
					<span className="text-base font-semibold tabular-nums text-foreground">
						{r.value}
					</span>
				</div>
			))}
			<div className="flex items-center justify-between py-3">
				<span className="text-base font-semibold text-foreground">
					{t("fees.total")}
				</span>
				<span className="text-base font-bold tabular-nums text-foreground">
					{fmtUsd(fees.totalUsd)}
				</span>
			</div>
		</div>
	);
}
