"use client";

import { useEffect, useRef, useState } from "react";

import { getSwapQuote, type NormalizedQuote, type QuoteRequest } from "@/lib/relay";

export interface SwapQuoteState {
	quote: NormalizedQuote | null;
	loading: boolean;
	error: string | null;
}

/** Burn address used for preview quotes when no wallet is connected. */
export const PREVIEW_USER = "0x000000000000000000000000000000000000dEaD";

/**
 * Debounced live Relay quote. Re-fetches whenever the request changes and
 * cancels stale results (only the latest applies), so typing an amount streams
 * fresh quotes without races. Pass `null` (or a zero amount) to clear.
 */
export function useSwapQuote(
	request: QuoteRequest | null,
	debounceMs = 400,
	refreshMs = 15000,
): SwapQuoteState {
	const [state, setState] = useState<SwapQuoteState>({
		quote: null,
		loading: false,
		error: null,
	});
	const seq = useRef(0);

	const key =
		request && Number(request.amount) > 0
			? JSON.stringify([
					request.originChainId,
					request.originCurrency,
					request.destinationChainId,
					request.destinationCurrency,
					request.amount,
					request.user,
					request.tradeType ?? "EXACT_INPUT",
				])
			: null;

	useEffect(() => {
		if (!key || !request) {
			setState({ quote: null, loading: false, error: null });
			return;
		}
		const id = ++seq.current;
		setState((s) => ({ ...s, loading: true, error: null }));
		const timer = setTimeout(() => {
			getSwapQuote({ ...request, user: request.user || PREVIEW_USER })
				.then((quote) => {
					if (id === seq.current) setState({ quote, loading: false, error: null });
				})
				.catch((e: unknown) => {
					if (id === seq.current) {
						setState({
							quote: null,
							loading: false,
							error: e instanceof Error ? e.message : "Quote failed",
						});
					}
				});
		}, debounceMs);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key, debounceMs]);

	// Keep the quote/fees fresh — Relay prices, gas, and route fees move and
	// quotes expire. Re-fetch on an interval while a request is active, silently
	// (no loading flicker; the prior quote stays until the new one arrives).
	useEffect(() => {
		if (!key || !request || refreshMs <= 0) return;
		const iv = setInterval(() => {
			const id = ++seq.current;
			getSwapQuote({ ...request, user: request.user || PREVIEW_USER })
				.then((quote) => {
					if (id === seq.current) setState({ quote, loading: false, error: null });
				})
				.catch(() => {
					// Keep the prior quote on a refresh failure.
				});
		}, refreshMs);
		return () => clearInterval(iv);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key, refreshMs]);

	return state;
}
