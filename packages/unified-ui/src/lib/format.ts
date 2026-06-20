import type { TokenRow } from "../types";

/** Format a slippage fraction as a percent string with trailing zeros trimmed. */
export function formatPct(fraction: number) {
	return `${Number((fraction * 100).toFixed(4))}%`;
}

/** Format a USD value with two decimals. */
export function fmtUsd(n: number) {
	return `$${n.toFixed(2)}`;
}

/** USD price per unit of a token: total usd ÷ holdings. 0 if NaN / divide-by-zero. */
export function price(token: TokenRow) {
	const usd = Number.parseFloat(token.usd.replace(/[^0-9.]/g, "")) || 0;
	const amount = Number.parseFloat(token.amount) || 0;
	if (!(usd > 0) || !(amount > 0)) return 0;
	return usd / amount;
}

/** Test amount: 1% of holdings, capped at ~$1 worth of the asset. */
export function computeTest(token: TokenRow) {
	const usd = Number.parseFloat(token.usd.replace(/[^0-9.]/g, "")) || 0;
	const amount = Number.parseFloat(token.amount) || 0;
	if (usd <= 0 || amount <= 0) return "0";
	const test = Math.min(0.01 * amount, amount / usd);
	return String(Number(test.toFixed(8)));
}

/** Shorten a wallet address (EVM or Solana) to `123456…wxyz` for display. */
export function truncateAddress(addr: string) {
	return addr.length <= 12 ? addr : `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export interface TokenDisplayParts {
	lead: string;
	/** Leading-zero count to render as a subscript, or null. */
	sub: string | null;
	rest: string;
}

/**
 * Split a token amount into display parts: a leading string, an optional
 * leading-zero count (rendered as a subscript, DexScreener-style), and the
 * remaining significant digits. Whole amounts group thousands and cap at 4
 * decimals; sub-1 amounts keep 4 significant digits, collapsing >3 leading
 * zeros to a subscript.
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
