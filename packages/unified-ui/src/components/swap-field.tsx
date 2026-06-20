"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "../lib/utils";
import type { Mode } from "../types";
import { HapticButton } from "./haptic-button";

/** Trim a number to a clean string (drops trailing zeros, caps at 8 decimals). */
export function trim(n: number) {
	return String(Number(n.toFixed(8)));
}

/** Trim a USD value to a clean string, capped at 2 decimal places. */
export function trimUsd(n: number) {
	return String(Number(n.toFixed(2)));
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

/**
 * Apply a keypad/keyboard key to the current amount string and return the next
 * string. `key` is "0"-"9", "." or "back". In USD mode digits past 2 decimals
 * are rejected (returns `current` unchanged). Pure — safe to call from both the
 * on-screen keypad and the physical-keyboard handler.
 */
export function applyAmountKey(current: string, key: string, mode: Mode): string {
	if (key === "back") return current.length <= 1 ? "0" : current.slice(0, -1);
	if (key === ".") return current.includes(".") ? current : `${current}.`;
	const next = sanitizeAmount(current === "0" ? key : current + key);
	if (mode === "usd") {
		const dot = next.indexOf(".");
		if (dot !== -1 && next.length - dot - 1 > 2) return current;
	}
	return next;
}

/**
 * Normalize a pasted string to an amount, or null if it isn't a plain number.
 * In USD mode the result is clamped to 2 decimals.
 */
export function sanitizePastedAmount(text: string, mode: Mode): string | null {
	const cleaned = text.trim().replace(/,/g, "");
	if (cleaned === "" || !/^[0-9]*\.?[0-9]*$/.test(cleaned)) return null;
	const next = sanitizeAmount(cleaned);
	return mode === "usd" ? trimUsd(Number(next) || 0) : next;
}

/**
 * The animated value inside a conversion Pill. In "token" mode the field is
 * entered in token units so the pill shows the USD equivalent ($, 2dp); in "usd"
 * mode it shows the token amount + symbol (up to 8dp, no grouping).
 */
export function ConversionValue({
	mode,
	usd,
	units,
	symbol,
}: {
	mode: Mode;
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
 * Animated amount display. Dollar values ($ prefix) never show more than 2
 * decimals; token amounts up to 8. The [--number-flow-mask-height:0px] kills
 * NumberFlow's top/bottom fade so large bold digits aren't clipped.
 */
export function AmountInput({
	value,
	prefix,
	muted,
	ariaLabel = "Amount",
	sizeClassName = "text-3xl md:text-5xl",
}: {
	value: string;
	prefix?: string;
	muted?: boolean;
	ariaLabel?: string;
	sizeClassName?: string;
}) {
	const maxFraction = prefix === "$" ? 2 : 8;
	const dot = value.indexOf(".");
	const fractionDigits =
		dot === -1 ? 0 : Math.min(value.length - dot - 1, maxFraction);
	return (
		<div
			role="textbox"
			aria-label={ariaLabel}
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

/** Shared CSS height transition for the animated amount fields. */
export const AMOUNT_FIELD_TRANSITION =
	"overflow-hidden transition-[height] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

/**
 * Measures the natural (content-box) height of an element and keeps it current
 * across breakpoint/value changes via a ResizeObserver. Returns the ref to put
 * on the content and its measured height (`null` until first measured). Used to
 * coordinate the generate-address animation: the "from" amount field grows by
 * exactly the height the removed "to" amount block gives up, so the card's total
 * height is unchanged.
 *
 * A hook rather than a wrapper component so call sites use inline JSX — a
 * `children: ReactNode` prop trips duplicated `@types/react`.
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
