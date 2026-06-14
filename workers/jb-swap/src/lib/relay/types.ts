/**
 * Normalized shapes the app consumes, decoupled from Relay's raw API payloads.
 * The raw Relay `Execute` object is kept on `NormalizedQuote.raw` so it can be
 * handed straight back to the SDK's `execute()`.
 */

export type RelayVmType =
	| "evm"
	| "svm"
	| "bvm"
	| "tvm"
	| "suivm"
	| "hypevm"
	| "lvm"
	| "tonvm";

export interface RelayChain {
	id: number;
	name: string;
	displayName: string;
	vmType: RelayVmType;
	/** The chain's native gas currency. */
	currency: { symbol: string; decimals: number; address: string };
	iconUrl?: string;
}

export interface RelayCurrency {
	chainId: number;
	address: string;
	symbol: string;
	name: string;
	decimals: number;
	logoUrl?: string;
	vmType?: RelayVmType;
}

export interface NormalizedQuoteFees {
	gasUsd: number;
	relayerUsd: number;
	appUsd: number;
	totalUsd: number;
}

/** Same asset+chain => send; different asset, same chain => swap; cross-chain => bridge. */
export type SwapKind = "send" | "swap" | "bridge";

export interface NormalizedQuote {
	kind: SwapKind;
	operation: string;
	/** Input, human units + base units + USD. */
	in: { amount: string; base: string; usd: number };
	/** Expected output, human units + base units + USD. */
	out: { amount: string; base: string; usd: number };
	/** out/in exchange rate. */
	rate: number;
	/** Destination slippage tolerance, percent (e.g. 0.5). */
	slippagePercent: number;
	/** Estimated fill time, seconds. */
	timeEstimateSec: number;
	fees: NormalizedQuoteFees;
	/** Raw Relay `Execute` object — pass to `executeSwap`. */
	raw: unknown;
}

export class RelayApiError extends Error {
	readonly status: number;
	readonly body: unknown;
	constructor(message: string, status: number, body?: unknown) {
		super(message);
		this.name = "RelayApiError";
		this.status = status;
		this.body = body;
	}
}

export const RELAY_API_BASE = "https://api.relay.link";
