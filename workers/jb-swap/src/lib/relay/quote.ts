import { getQuote } from "@relayprotocol/relay-sdk";

import { ensureRelayClient } from "./client";
import type { NormalizedQuote, NormalizedQuoteFees, SwapKind } from "./types";
import { fromBaseUnits, toBaseUnits, toUsdNumber } from "./units";

export interface QuoteRequest {
	user: string;
	recipient?: string;
	originChainId: number;
	originCurrency: string;
	originDecimals: number;
	destinationChainId: number;
	destinationCurrency: string;
	destinationDecimals: number;
	/** Human-unit amount (interpreted per `tradeType`, default EXACT_INPUT). */
	amount: string;
	tradeType?: "EXACT_INPUT" | "EXACT_OUTPUT";
}

/** Same asset+chain => send, different asset same chain => swap, cross-chain => bridge. Pure. */
export function quoteKind(
	originChainId: number,
	originCurrency: string,
	destChainId: number,
	destCurrency: string,
): SwapKind {
	if (originChainId !== destChainId) return "bridge";
	if (originCurrency.toLowerCase() !== destCurrency.toLowerCase()) return "swap";
	return "send";
}

/** Normalize a raw Relay `Execute` quote. Pure — unit-tested with captured payloads. */
export function parseQuote(
	raw: Record<string, unknown>,
	ctx: { kind: SwapKind; originDecimals: number; destinationDecimals: number },
): NormalizedQuote {
	const details = (raw?.details ?? {}) as Record<string, unknown>;
	const ci = (details?.currencyIn ?? {}) as Record<string, unknown>;
	const co = (details?.currencyOut ?? {}) as Record<string, unknown>;
	const fees = (raw?.fees ?? {}) as Record<string, Record<string, unknown>>;

	const f: NormalizedQuoteFees = {
		gasUsd:
			toUsdNumber(fees?.gas?.amountUsd) + toUsdNumber(fees?.relayerGas?.amountUsd),
		relayerUsd:
			toUsdNumber(fees?.relayer?.amountUsd) +
			toUsdNumber(fees?.relayerService?.amountUsd),
		appUsd: toUsdNumber(fees?.app?.amountUsd),
		totalUsd: 0,
	};
	f.totalUsd = f.gasUsd + f.relayerUsd + f.appUsd;

	const inBase = String(ci?.amount ?? "0");
	const outBase = String(co?.amount ?? "0");
	const slippage = (details?.slippageTolerance ?? {}) as {
		destination?: { percent?: unknown };
	};

	return {
		kind: ctx.kind,
		operation: String(details?.operation ?? ctx.kind),
		in: {
			amount:
				(ci?.amountFormatted as string) ?? fromBaseUnits(inBase, ctx.originDecimals),
			base: inBase,
			usd: toUsdNumber(ci?.amountUsd),
		},
		out: {
			amount:
				(co?.amountFormatted as string) ??
				fromBaseUnits(outBase, ctx.destinationDecimals),
			base: outBase,
			usd: toUsdNumber(co?.amountUsd),
		},
		rate: Number(details?.rate) || 0,
		slippagePercent: Number(slippage?.destination?.percent) || 0,
		timeEstimateSec: Number(details?.timeEstimate) || 0,
		fees: f,
		raw,
	};
}

/** Fetch + normalize a live quote from Relay (read-only; no signing). */
export async function getSwapQuote(req: QuoteRequest): Promise<NormalizedQuote> {
	ensureRelayClient();
	const kind = quoteKind(
		req.originChainId,
		req.originCurrency,
		req.destinationChainId,
		req.destinationCurrency,
	);
	const amountBase = toBaseUnits(req.amount, req.originDecimals);
	const raw = (await getQuote({
		chainId: req.originChainId,
		currency: req.originCurrency,
		toChainId: req.destinationChainId,
		toCurrency: req.destinationCurrency,
		amount: amountBase,
		tradeType: req.tradeType ?? "EXACT_INPUT",
		user: req.user,
		recipient: req.recipient ?? req.user,
	})) as unknown as Record<string, unknown>;
	return parseQuote(raw, {
		kind,
		originDecimals: req.originDecimals,
		destinationDecimals: req.destinationDecimals,
	});
}
