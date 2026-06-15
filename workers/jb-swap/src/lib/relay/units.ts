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

const SUBSCRIPT_DIGITS = "₀₁₂₃₄₅₆₇₈₉";

/** Render a count as unicode subscript digits (11 -> "₁₁"). */
export function toSubscript(count: number): string {
	return String(count).replace(/\d/g, (d) => SUBSCRIPT_DIGITS[Number(d)]);
}

/**
 * Display a token amount at a readable resolution (display only — never use the
 * result for math):
 *  - `>= 1`  -> grouped, up to 4 decimals trimmed (e.g. "1,190.9824")
 *  - `< 1`   -> the first 4 significant digits; when there are 4+ leading zeros
 *              after the decimal they collapse to DexScreener subscript notation
 *              (e.g. 0.0₁₁1089). Fewer than 4 leading zeros render literally
 *              (e.g. 0.004221, 0.02805).
 */
export interface TokenDisplayParts {
	/** Text before the subscript (the whole value when there's no subscript). */
	lead: string;
	/** Zero-count as a plain string (e.g. "11"), or null when no subscript. */
	sub: string | null;
	/** Significant digits after the subscript. */
	rest: string;
}

/**
 * The structured form of {@link formatTokenDisplay} — lets a renderer style the
 * subscript (size/baseline) instead of using the tiny unicode subscript glyphs.
 */
export function formatTokenParts(value: string | number): TokenDisplayParts {
	if (typeof value === "number" && !Number.isFinite(value)) {
		return { lead: "0", sub: null, rest: "" };
	}
	const raw =
		typeof value === "string"
			? value.trim()
			: value.toLocaleString("en-US", {
					maximumFractionDigits: 20,
					useGrouping: false,
				});
	if (raw === "" || Number(raw) === 0) return { lead: "0", sub: null, rest: "" };

	const sign = raw.startsWith("-") ? "-" : "";
	const abs = sign ? raw.slice(1) : raw;
	const [whole = "0", fracRaw = ""] = abs.split(".");

	if (whole !== "0" && whole !== "") {
		const dec = fracRaw.slice(0, 4).replace(/0+$/, "");
		const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return { lead: sign + (dec ? `${grouped}.${dec}` : grouped), sub: null, rest: "" };
	}

	const frac = fracRaw.replace(/0+$/, "");
	const zeros = frac.length - frac.replace(/^0+/, "").length;
	const sig = frac.replace(/^0+/, "").slice(0, 4) || "0";
	// Only collapse to subscript once there are more than 3 leading zeros.
	if (zeros >= 4) return { lead: `${sign}0.0`, sub: String(zeros), rest: sig };
	return { lead: `${sign}0.${"0".repeat(zeros)}${sig}`, sub: null, rest: "" };
}

/** Plain-string token amount (unicode subscript); see TokenAmount for JSX. */
export function formatTokenDisplay(value: string | number): string {
	const { lead, sub, rest } = formatTokenParts(value);
	return sub ? `${lead}${toSubscript(Number(sub))}${rest}` : lead;
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
