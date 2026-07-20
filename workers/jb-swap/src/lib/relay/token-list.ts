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

/**
 * Chains pinned to the head of the filter row, in this order. These lead
 * regardless of measured volume — see {@link pinPriorityChains}.
 */
const CHAIN_PRIORITY = [
	1, // Ethereum
	8453, // Base
	42161, // Arbitrum
	10, // Optimism
	4663, // Robinhood Chain
	137, // Polygon
	792703809, // Solana
	56, // BNB
	43114, // Avalanche
	130, // Unichain
];

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
	return Array.from(seen.values()).sort((a, b) => a.chainId - b.chainId);
})();

/**
 * Lift {@link CHAIN_PRIORITY} chains to the front, preserving the incoming
 * order for everything else.
 *
 * This is applied *after* the volume sort, not before: volume ranking would
 * otherwise bury a pinned chain the moment `/api/volume` resolves, so a chain
 * pinned pre-hydration would visibly jump to the back a second after mount.
 * Pinned chains absent from `chains` are skipped. Returns a new array.
 */
export function pinPriorityChains(
	chains: RelayChainOption[],
): RelayChainOption[] {
	const byId = new Map(chains.map((c) => [c.chainId, c]));
	const pinned: RelayChainOption[] = [];
	for (const id of CHAIN_PRIORITY) {
		const hit = byId.get(id);
		if (hit) pinned.push(hit);
	}
	const pinnedIds = new Set(pinned.map((c) => c.chainId));
	return [...pinned, ...chains.filter((c) => !pinnedIds.has(c.chainId))];
}
