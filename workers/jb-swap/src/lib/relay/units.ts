/**
 * Decimal <-> base-unit conversions for token amounts. All math is done with
 * plain string manipulation (no floating point, no BigInt-literal needs) so an
 * on-chain amount is never subject to float drift. A "base unit" is the
 * smallest indivisible unit (wei for an 18-decimal token), represented as a
 * decimal string of a non-negative integer.
 */

/** `"1.5", 6` -> `"1500000"`. Fractional digits beyond `decimals` are truncated. */
export function toBaseUnits(amount: string, decimals: number): string {
	if (!Number.isInteger(decimals) || decimals < 0) {
		throw new Error(`invalid decimals: ${decimals}`);
	}
	const cleaned = amount.trim();
	if (cleaned === "" || cleaned === ".") return "0";
	if (!/^\d*\.?\d*$/.test(cleaned)) {
		throw new Error(`invalid amount: ${amount}`);
	}
	const [whole = "0", fracRaw = ""] = cleaned.split(".");
	const frac = fracRaw.slice(0, decimals).padEnd(decimals, "0");
	const combined = `${whole}${frac}`.replace(/^0+(?=\d)/, "");
	return combined === "" ? "0" : combined;
}

/** `"1500000", 6` -> `"1.5"`. Trailing fractional zeros are trimmed. */
export function fromBaseUnits(base: string, decimals: number): string {
	if (!Number.isInteger(decimals) || decimals < 0) {
		throw new Error(`invalid decimals: ${decimals}`);
	}
	const negative = base.startsWith("-");
	const digits = (negative ? base.slice(1) : base).replace(/^0+(?=\d)/, "") || "0";
	if (!/^\d+$/.test(digits)) throw new Error(`invalid base units: ${base}`);
	const padded = digits.padStart(decimals + 1, "0");
	const whole = padded.slice(0, padded.length - decimals);
	const frac =
		decimals === 0
			? ""
			: padded.slice(padded.length - decimals).replace(/0+$/, "");
	const sign = negative && digits !== "0" ? "-" : "";
	return frac ? `${sign}${whole}.${frac}` : `${sign}${whole}`;
}

/** Display a base-unit amount, capped to `maxFractionDigits` trimmed fractional digits. */
export function formatTokenAmount(
	base: string,
	decimals: number,
	maxFractionDigits = 8,
): string {
	const full = fromBaseUnits(base, decimals);
	const [whole, frac = ""] = full.split(".");
	if (!frac) return whole;
	const trimmed = frac.slice(0, maxFractionDigits).replace(/0+$/, "");
	return trimmed ? `${whole}.${trimmed}` : whole;
}

/** Parse a USD-ish value (number or "$1,234.56") to a number; 0 when unparseable. */
export function toUsdNumber(value: unknown): number {
	if (typeof value === "number") return Number.isFinite(value) ? value : 0;
	if (typeof value === "string") {
		const n = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
		return Number.isFinite(n) ? n : 0;
	}
	return 0;
}
