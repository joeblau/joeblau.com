import tokenListJson from "@/data/relay-token-list.json";

import type { TokenRow } from "@/components/token-drawer";

/** A single entry in a Uniswap-schema token list. */
export interface UniswapToken {
	chainId: number;
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	logoURI?: string;
	extensions?: {
		vmType?: string;
		verified?: boolean;
		chainName?: string;
	};
}

/** The Uniswap-schema token list document (https://uniswap.org/tokenlist.schema.json). */
export interface UniswapTokenList {
	name: string;
	timestamp: string;
	version: { major: number; minor: number; patch: number };
	tokens: UniswapToken[];
}

/** The generated Relay whitelist (regenerate with `bun run build:tokens`). */
export const RELAY_TOKEN_LIST = tokenListJson as UniswapTokenList;

const relayIcon = (chainId: number) =>
	`https://assets.relay.link/icons/${chainId}/light.png`;

/**
 * Map a Uniswap-list token to the app's TokenRow. Holdings are unknown here, so
 * `amount`/`usd` are zeroed — the drawer hides them until real balances are
 * fetched for a connected wallet.
 */
export function toTokenRow(t: UniswapToken): TokenRow {
	return {
		name: t.name,
		symbol: t.symbol,
		chain: t.extensions?.chainName ?? String(t.chainId),
		chainId: t.chainId,
		address: t.address,
		logo: t.logoURI ?? relayIcon(t.chainId),
		amount: "0",
		usd: "$0",
		decimals: t.decimals,
		vmType: t.extensions?.vmType === "svm" ? "svm" : "evm",
	};
}

/** Every Relay-supported token, as the app's TokenRow[]. */
export const relayTokens: TokenRow[] = RELAY_TOKEN_LIST.tokens.map(toTokenRow);

export interface RelayChainOption {
	chainId: number;
	name: string;
	icon: string;
}

/** Popular chains surfaced first in the filter row; the rest follow by id. */
const CHAIN_PRIORITY = [1, 8453, 42161, 10, 137, 792703809, 56, 43114, 130];

/** Every chain present in the token list, for the drawer's chain filter chips. */
export const relayChains: RelayChainOption[] = (() => {
	const seen = new Map<number, RelayChainOption>();
	for (const t of RELAY_TOKEN_LIST.tokens) {
		if (!seen.has(t.chainId)) {
			seen.set(t.chainId, {
				chainId: t.chainId,
				name: t.extensions?.chainName ?? String(t.chainId),
				icon: `https://assets.relay.link/icons/${t.chainId}/light.png`,
			});
		}
	}
	return Array.from(seen.values()).sort((a, b) => {
		const ra = CHAIN_PRIORITY.indexOf(a.chainId);
		const rb = CHAIN_PRIORITY.indexOf(b.chainId);
		if (ra !== -1 || rb !== -1) {
			return (ra === -1 ? Infinity : ra) - (rb === -1 ? Infinity : rb);
		}
		return a.chainId - b.chainId;
	});
})();
