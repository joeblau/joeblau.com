"use client";

import { useEffect, useState } from "react";

import type { TokenRow } from "@/components/token-drawer";
import { fetchEvmHeldTokens } from "@/lib/relay/balances";
import { relayTokens } from "@/lib/relay/token-list";
import { useWallet } from "@/lib/use-wallet";

/**
 * The tokens the connected EVM wallet actually holds (balance > 0), found by
 * multicalling `balanceOf` across the catalog. `null` until loaded / when not
 * connected. Pass `enabled = false` to skip the scan (e.g. the "to" picker,
 * which should show the full catalog).
 */
export function useHeldTokens(enabled: boolean): {
	tokens: TokenRow[] | null;
	loading: boolean;
} {
	const { connected, evmAddress } = useWallet();
	const [tokens, setTokens] = useState<TokenRow[] | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!enabled || !connected || !evmAddress) {
			setTokens(null);
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		fetchEvmHeldTokens(evmAddress, relayTokens)
			.then((held) => {
				if (!cancelled) {
					setTokens(held);
					setLoading(false);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setTokens([]);
					setLoading(false);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [enabled, connected, evmAddress]);

	return { tokens, loading };
}
