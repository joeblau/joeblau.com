"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useRef, useState } from "react";

import { HapticButton } from "@/components/haptic-button";
import { useTranslations } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

/** Trim a number to a clean string (drops trailing zeros, caps at 8 decimals). */
export function trim(n: number) {
	return String(Number(n.toFixed(8)));
}

/** Trim a USD value to a clean string, capped at 2 decimal places. */
export function trimUsd(n: number) {
	return String(Number(n.toFixed(2)));
}

/**
 * Convert a raw *token unit* string into whatever denomination `mode` is
 * showing, for the Max / Test shortcuts.
 *
 * Those shortcuts report holdings in token units, but the editable amount is
 * denominated by the active mode — storing units verbatim while in USD mode
 * makes them read as dollars (a 0.004220 ETH balance renders as "$0.00").
 *
 * Floors to the cent instead of rounding: Max must never resolve back to more
 * units than the wallet holds, and `toFixed(2)` rounds half-up, which would
 * push it just past the balance. Sub-cent holdings therefore floor to "0" —
 * USD mode only has two decimals to work with. Returns "0" if the price is
 * unknown, since there is no honest dollar figure to show.
 */
export function unitsToMode(units: string, mode: "token" | "usd", price: number) {
	if (mode !== "usd") return units;
	if (!(price > 0)) return "0";
	return String(Math.floor((Number(units) || 0) * price * 100) / 100);
}

/** Keep only digits and a single decimal point; strip leading zeros. */
export function sanitizeAmount(raw: string) {
	let v = raw.replace(/[^0-9.]/g, "");
	const dot = v.indexOf(".");
	if (dot !== -1) {
		v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, "");
	}
	v = v.replace(/^0+(\d)/, "$1");
	return v === "" || v === "." ? "0" : v;
}

/** Shared CSS height transition for the animated amount fields. */
export const AMOUNT_FIELD_TRANSITION =
	"overflow-hidden transition-[height] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

/**
 * The animated value inside a conversion Pill. In "token" mode the field is
 * entered in token units so the pill shows the USD equivalent ($, 2dp); in
 * "usd" mode it shows the token amount + symbol (up to 8dp, no grouping).
 * NumberFlow animates digit changes the same way the main AmountInput does.
 */
export function ConversionValue({
	mode,
	usd,
	units,
	symbol,
}: {
	mode: "token" | "usd";
	usd: number;
	units: number;
	symbol: string;
}) {
	if (mode === "token") {
		return (
			<NumberFlow
				value={usd}
				prefix="$"
				format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
				className="overflow-hidden [--number-flow-mask-height:0px]"
			/>
		);
	}
	return (
		<NumberFlow
			value={units}
			suffix={symbol ? ` ${symbol}` : ""}
			format={{ maximumFractionDigits: 8, useGrouping: false }}
			className="overflow-hidden [--number-flow-mask-height:0px]"
		/>
	);
}

export function Pill({
	onClick,
	children,
}: {
	onClick?: () => void;
	children: React.ReactNode;
}) {
	return (
		<HapticButton
			type="button"
			onClick={onClick}
			wrapperClassName="pointer-events-auto inline-grid"
			className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-foreground/[0.07] px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.12]"
		>
			{children}
		</HapticButton>
	);
}

/**
 * Animated amount display. Typing, the keypad, and paste are handled globally
 * by SwapCard and always drive the "from" amount.
 */
export function AmountInput({
	value,
	prefix,
	muted,
	sizeClassName = "text-3xl md:text-5xl",
}: {
	value: string;
	prefix?: string;
	muted?: boolean;
	sizeClassName?: string;
}) {
	const t = useTranslations();
	// Dollar values ($ prefix) never show more than 2 decimals; token amounts up to 8.
	const maxFraction = prefix === "$" ? 2 : 8;
	const dot = value.indexOf(".");
	const fractionDigits =
		dot === -1 ? 0 : Math.min(value.length - dot - 1, maxFraction);
	return (
		<div
			role="textbox"
			aria-label={t("swapCard.amountInput.ariaLabel")}
			tabIndex={0}
			className="cursor-text overflow-hidden rounded-lg outline-none"
		>
			<NumberFlow
				value={Number(value) || 0}
				prefix={prefix}
				suffix={value.endsWith(".") ? "." : ""}
				format={{
					minimumFractionDigits: fractionDigits,
					maximumFractionDigits: maxFraction,
					useGrouping: false,
				}}
				className={cn(
					"font-bold tracking-tight [--number-flow-mask-height:0px]",
					sizeClassName,
					muted ? "text-muted-foreground" : "text-foreground",
				)}
			/>
		</div>
	);
}

/**
 * Measures the natural (content-box) height of an element and keeps it current
 * across breakpoint/value changes via a ResizeObserver. Returns the ref to put
 * on the content and its measured height (`null` until first measured). Used to
 * coordinate the generate-address animation: the "from" amount field grows by
 * exactly the height the removed "to" amount block gives up, so the card's total
 * height is unchanged.
 *
 * A hook rather than a wrapper component so call sites use inline JSX — a
 * `children: ReactNode` prop trips the repo's duplicated `@types/react`.
 */
export function useMeasuredHeight() {
	const ref = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const measure = () => setHeight(el.offsetHeight);
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	return { ref, height };
}
