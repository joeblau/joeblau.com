"use client";

import { useCallback, useState } from "react";

import { executeSwap, type ExecuteProgress, type NormalizedQuote } from "@/lib/relay";
import { useWallet } from "@/lib/use-wallet";

export type ExecStatus =
	| "idle"
	| "preparing"
	| "executing"
	| "success"
	| "error";

/**
 * Execute a normalized quote with the connected wallet. If no wallet is
 * connected it opens the connect flow instead. Surfaces a coarse `status` plus
 * streamed step `progress` for the submit UI. SIGNS REAL TRANSACTIONS.
 */
export function useExecuteSwap() {
	const { getAdaptedWallet, connected, connect } = useWallet();
	const [status, setStatus] = useState<ExecStatus>("idle");
	const [error, setError] = useState<string | null>(null);
	const [progress, setProgress] = useState<ExecuteProgress | null>(null);

	const run = useCallback(
		async (quote: NormalizedQuote) => {
			setError(null);
			if (!connected) {
				connect();
				return;
			}
			try {
				setStatus("preparing");
				const wallet = await getAdaptedWallet();
				setStatus("executing");
				await executeSwap(quote, wallet, setProgress);
				setStatus("success");
			} catch (e) {
				setError(e instanceof Error ? e.message : "Transaction failed");
				setStatus("error");
			}
		},
		[connected, connect, getAdaptedWallet],
	);

	const reset = useCallback(() => {
		setStatus("idle");
		setError(null);
		setProgress(null);
	}, []);

	return {
		run,
		reset,
		status,
		error,
		progress,
		busy: status === "preparing" || status === "executing",
	};
}
