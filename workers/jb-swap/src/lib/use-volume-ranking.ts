"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { RelayChainOption } from "@/lib/relay/token-list";
import type { Direction, VolumeData } from "@/lib/volume-ranking";
import {
	fetchVolumeProxy,
	sortChainsByVolume,
	sortTokensByVolume,
} from "@/lib/volume-ranking";

import type { TokenRow } from "@/components/token-drawer";

/** How often to refresh the proxy. 60s stays well under CoinGecko's free limit. */
const POLL_INTERVAL_MS = 60_000;

/** Stable empty value for SSR + first client render (avoids hydration mismatch). */
const EMPTY_DATA: VolumeData = { bySymbol: {}, byChainId: {} };

/**
 * Poll the volume proxy and expose memoized sorters.
 *
 * Starts with EMPTY maps so the server render and the first client render match
 * (no hydration mismatch); the first fetch runs on mount and then every 60s.
 * The last good {@link VolumeData} is held in state — a failed refresh returns
 * empty maps and is ignored, so the UI keeps the previous ranking
 * (stale-while-error).
 */
export function useVolumeRanking() {
	const [data, setData] = useState<VolumeData>(EMPTY_DATA);

	useEffect(() => {
		let cancelled = false;

		const refresh = async () => {
			const next = await fetchVolumeProxy();
			if (cancelled) return;
			// Ignore an empty result (cold-start failure / soft 429) so we keep the
			// last good data instead of clearing the ranking.
			if (Object.keys(next.bySymbol).length === 0) return;
			setData(next);
		};

		void refresh();
		const id = setInterval(() => void refresh(), POLL_INTERVAL_MS);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, []);

	const sortTokens = useCallback(
		(tokens: TokenRow[], direction: Direction) =>
			sortTokensByVolume(tokens, data, direction),
		[data],
	);

	const sortChains = useCallback(
		(chains: RelayChainOption[], direction: Direction) =>
			sortChainsByVolume(chains, data, direction),
		[data],
	);

	return useMemo(
		() => ({ data, sortTokens, sortChains }),
		[data, sortTokens, sortChains],
	);
}
