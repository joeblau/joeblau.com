import type { RelayChainOption } from "@/lib/relay/token-list";
import { relayTokens } from "@/lib/relay/token-list";

import type { TokenRow } from "@/components/token-drawer";

/**
 * Real-time volume-proxy ranking for the swap token/chain lists.
 *
 * Source of truth is CoinGecko's free `coins/markets` endpoint (no API key),
 * which returns the top coins sorted by 24h volume. We turn that into two
 * lookup maps — per-symbol volume and per-chain aggregate volume — and use
 * them only as a RELATIVE ranking proxy, never as exact figures.
 *
 * CoinGecko's markets endpoint has no contract address, so the join key is the
 * (uppercased) ticker symbol; address is unusable here. Tickers can collide
 * across wrapped/bridged variants, so we keep the MAX volume per symbol.
 */

/**
 * Bridge direction. Accepted by the sort helpers today but applied IDENTICALLY
 * for both sides — CoinGecko's 24h volume is a single global figure with no
 * From/To (source/destination) split. Once a real directional bridge-flow feed
 * exists (per-chain inbound vs outbound liquidity), the helpers can diverge by
 * direction without changing their call sites.
 */
export type Direction = "withdraw" | "deposit";

export interface VolumeData {
	/** UPPERCASE symbol -> 24h volume (USD). */
	bySymbol: Record<string, number>;
	/** chainId -> summed proxy volume of that chain's tokens. */
	byChainId: Record<number, number>;
}

/** CoinGecko free markets endpoint — 250 coins, already sorted volume_desc. */
const MARKETS_ENDPOINT =
	"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=250&page=1";

/** Abort the fetch if it stalls; a slow call should fall back, not hang the UI. */
const FETCH_TIMEOUT_MS = 20_000;

/** Shape of the single coin objects we read from the markets response. */
interface CoinMarket {
	symbol?: string;
	total_volume?: number;
}

/** Empty maps — the safe value we return on any failure (never throw). */
function emptyVolumeData(): VolumeData {
	return { bySymbol: {}, byChainId: {} };
}

/**
 * Fetch the free CoinGecko markets endpoint and build the volume proxy maps.
 * Never throws: any non-200, timeout, or parse error resolves to empty maps so
 * callers can keep serving stale/empty data without crashing the swap UI.
 */
export async function fetchVolumeProxy(): Promise<VolumeData> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
	try {
		const res = await fetch(MARKETS_ENDPOINT, {
			signal: controller.signal,
			headers: {
				// Some CoinGecko edge nodes reject an empty User-Agent. No API key
				// headers are needed (nor wanted) on the free tier.
				accept: "application/json",
				"user-agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
			},
		});
		// A 429 (rate limited) or any non-200 is a soft failure: serve the
		// fallback (empty here; the hook keeps the last good data).
		if (!res.ok) return emptyVolumeData();
		const coins = (await res.json()) as CoinMarket[];
		if (!Array.isArray(coins)) return emptyVolumeData();

		// 1) symbol -> volume, keeping the MAX so colliding tickers (wrapped /
		//    bridged variants) don't clobber the higher-volume entry.
		const bySymbol: Record<string, number> = {};
		for (const coin of coins) {
			if (typeof coin.symbol !== "string") continue;
			const sym = coin.symbol.toUpperCase();
			const vol = typeof coin.total_volume === "number" ? coin.total_volume : 0;
			bySymbol[sym] = Math.max(bySymbol[sym] ?? 0, vol);
		}

		// 2) chainId -> summed proxy volume of that chain's tokens. De-dupe by
		//    symbol within a chain so a ticker isn't double-counted.
		const byChainId: Record<number, number> = {};
		const seenPerChain = new Map<number, Set<string>>();
		for (const tok of relayTokens) {
			const sym = tok.symbol.toUpperCase();
			let seen = seenPerChain.get(tok.chainId);
			if (!seen) {
				seen = new Set<string>();
				seenPerChain.set(tok.chainId, seen);
			}
			if (seen.has(sym)) continue;
			seen.add(sym);
			byChainId[tok.chainId] = (byChainId[tok.chainId] ?? 0) + (bySymbol[sym] ?? 0);
		}

		return { bySymbol, byChainId };
	} catch {
		// Timeout (abort), network error, or JSON parse error — fall back quietly.
		return emptyVolumeData();
	} finally {
		clearTimeout(timeout);
	}
}

/**
 * Stable sort of tokens, clustering by CHAIN volume first then by per-asset
 * volume within each chain — i.e. "chains ranked by deposit/withdraw volume,
 * assets per chain", not a flat per-token ranking. Unknown chains/symbols
 * (volume 0) keep their original relative order at the end so the list stays
 * deterministic regardless of the data source state.
 *
 * `direction` is accepted but currently applied identically for both sides —
 * see {@link Direction}. Returns a new array; never mutates the input (the
 * input often derives from the shared module-level catalog).
 */
export function sortTokensByVolume(
	tokens: TokenRow[],
	data: VolumeData,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for a real directional feed
	direction: Direction,
): TokenRow[] {
	const chainVol = (t: TokenRow) => data.byChainId[t.chainId] ?? 0;
	const tokenVol = (t: TokenRow) => data.bySymbol[t.symbol.toUpperCase()] ?? 0;
	return tokens
		.map((token, index) => ({ token, index }))
		.sort((a, b) => {
			// Primary: the token's chain, ranked by aggregate volume.
			const chainDiff = chainVol(b.token) - chainVol(a.token);
			if (chainDiff !== 0) return chainDiff;
			// Secondary: highest-volume assets first within the same chain.
			const tokenDiff = tokenVol(b.token) - tokenVol(a.token);
			if (tokenDiff !== 0) return tokenDiff;
			// Tie (incl. both unknown) -> preserve original order for stability.
			return a.index - b.index;
		})
		.map((entry) => entry.token);
}

/**
 * Stable sort of chains by aggregate proxy volume, descending. Unknown chains
 * (no tokens with known volume) keep their original relative order last.
 *
 * `direction` is accepted but currently applied identically for both sides —
 * see {@link Direction}. Returns a new array; never mutates the input.
 */
export function sortChainsByVolume(
	chains: RelayChainOption[],
	data: VolumeData,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for a real directional feed
	direction: Direction,
): RelayChainOption[] {
	const vol = (c: RelayChainOption) => data.byChainId[c.chainId] ?? 0;
	return chains
		.map((chain, index) => ({ chain, index }))
		.sort((a, b) => {
			const diff = vol(b.chain) - vol(a.chain);
			return diff !== 0 ? diff : a.index - b.index;
		})
		.map((entry) => entry.chain);
}
