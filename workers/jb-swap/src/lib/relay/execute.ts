import { execute, type AdaptedWallet } from "@relayprotocol/relay-sdk";

import type { NormalizedQuote } from "./types";

type ExecuteParams = Parameters<typeof execute>[0];
export type ExecuteProgress = Parameters<NonNullable<ExecuteParams["onProgress"]>>[0];

/**
 * Execute a normalized quote with a connected wallet. This SIGNS AND SUBMITS
 * real transaction(s) via Relay's executeSteps — only invoke it from a user
 * gesture with a connected, funded wallet. `onProgress` streams step state for
 * the UI. The promise resolves once Relay reports the request complete.
 */
export async function executeSwap(
	quote: NormalizedQuote,
	wallet: AdaptedWallet,
	onProgress?: (progress: ExecuteProgress) => void,
) {
	return execute({
		quote: quote.raw as ExecuteParams["quote"],
		wallet,
		onProgress,
	});
}
