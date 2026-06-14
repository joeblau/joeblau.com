import { describe, expect, test } from "bun:test";

import quoteFixture from "./__fixtures__/quote-eth-usdc.json";
import { parseQuote, quoteKind } from "./quote";
import type { SwapKind } from "./types";

describe("quoteKind", () => {
	test("same chain + same currency => send", () => {
		expect(quoteKind(1, "0xabc", 1, "0xabc")).toBe("send");
	});

	test("same chain + different currency => swap", () => {
		expect(quoteKind(1, "0xaaa", 1, "0xbbb")).toBe("swap");
	});

	test("different chain => bridge (even with same currency)", () => {
		expect(quoteKind(1, "0xabc", 8453, "0xabc")).toBe("bridge");
	});

	test("different chain => bridge (with different currency too)", () => {
		expect(quoteKind(8453, "0xeth", 42161, "0xusdc")).toBe("bridge");
	});

	test("currency comparison is case-insensitive => send when only case differs", () => {
		expect(quoteKind(1, "0xABCdef", 1, "0xabcdef")).toBe("send");
		expect(quoteKind(1, "ETH", 1, "eth")).toBe("send");
	});

	test("case-insensitive comparison still detects a genuine swap", () => {
		expect(quoteKind(1, "0xAAA", 1, "0xBBB")).toBe("swap");
	});

	test("chain id mismatch takes precedence over currency match", () => {
		// chains differ -> bridge, regardless of identical currencies
		expect(quoteKind(10, "USDC", 137, "usdc")).toBe("bridge");
	});

	test("native-token symbol form (same chain, same symbol) => send", () => {
		expect(quoteKind(8453, "ETH", 8453, "ETH")).toBe("send");
	});
});

describe("parseQuote - captured real fixture (eth -> usdc bridge/swap)", () => {
	const ctx = {
		kind: "bridge" as SwapKind,
		originDecimals: 18,
		destinationDecimals: 6,
	};
	const parsed = parseQuote(
		quoteFixture as unknown as Record<string, unknown>,
		ctx,
	);

	test("kind comes from ctx", () => {
		expect(parsed.kind).toBe("bridge");
	});

	test("operation reflects the fixture's details.operation", () => {
		// fixture details.operation === "swap"
		expect(parsed.operation).toBe("swap");
	});

	test("input amount is ~0.005", () => {
		expect(Number(parsed.in.amount)).toBeCloseTo(0.005, 6);
		expect(parsed.in.amount).toBe("0.005");
	});

	test("input base units preserved as the raw base string", () => {
		expect(parsed.in.base).toBe("5000000000000000");
	});

	test("input USD is positive", () => {
		expect(parsed.in.usd).toBeGreaterThan(0);
		expect(parsed.in.usd).toBeCloseTo(8.52095, 5);
	});

	test("output amount + base reflect the USDC leg", () => {
		expect(parsed.out.amount).toBe("8.494318");
		expect(parsed.out.base).toBe("8494318");
	});

	test("output USD is positive", () => {
		expect(parsed.out.usd).toBeGreaterThan(0);
		expect(parsed.out.usd).toBeCloseTo(8.492619, 5);
	});

	test("rate is positive", () => {
		expect(parsed.rate).toBeGreaterThan(0);
		expect(parsed.rate).toBeCloseTo(1698.8636, 4);
	});

	test("slippage percent reflects destination slippage", () => {
		expect(parsed.slippagePercent).toBeCloseTo(1.99, 2);
	});

	test("time estimate is parsed", () => {
		expect(parsed.timeEstimateSec).toBe(1);
	});

	test("fees.totalUsd is >= 0", () => {
		expect(parsed.fees.totalUsd).toBeGreaterThanOrEqual(0);
	});

	test("fees aggregate correctly from the fixture", () => {
		// gasUsd = gas(0.000284) + relayerGas(0.002178)
		expect(parsed.fees.gasUsd).toBeCloseTo(0.000284 + 0.002178, 9);
		// relayerUsd = relayer(0.028097) + relayerService(0.025919)
		expect(parsed.fees.relayerUsd).toBeCloseTo(0.028097 + 0.025919, 9);
		// app fee is "0" in fixture
		expect(parsed.fees.appUsd).toBe(0);
		expect(parsed.fees.totalUsd).toBeCloseTo(
			parsed.fees.gasUsd + parsed.fees.relayerUsd + parsed.fees.appUsd,
			9,
		);
	});

	test("raw is the exact fixture object reference", () => {
		expect(parsed.raw).toBe(quoteFixture);
	});
});

describe("parseQuote - explicit fee aggregation with hand-built raw", () => {
	const raw: Record<string, unknown> = {
		fees: {
			gas: { amountUsd: "1" },
			relayerGas: { amountUsd: "2" },
			relayer: { amountUsd: "3" },
			relayerService: { amountUsd: "4" },
			app: { amountUsd: "5" },
		},
	};
	const parsed = parseQuote(raw, {
		kind: "swap",
		originDecimals: 18,
		destinationDecimals: 18,
	});

	test("gasUsd = gas + relayerGas = 3", () => {
		expect(parsed.fees.gasUsd).toBe(3);
	});

	test("relayerUsd = relayer + relayerService = 7", () => {
		expect(parsed.fees.relayerUsd).toBe(7);
	});

	test("appUsd = app = 5", () => {
		expect(parsed.fees.appUsd).toBe(5);
	});

	test("totalUsd = gas + relayer + app = 15", () => {
		expect(parsed.fees.totalUsd).toBe(15);
	});
});

describe("parseQuote - fee aggregation with numeric and currency-formatted USD", () => {
	test("numeric amountUsd values aggregate", () => {
		const parsed = parseQuote(
			{
				fees: {
					gas: { amountUsd: 0.5 },
					relayerGas: { amountUsd: 1.5 },
					relayer: { amountUsd: 2 },
				},
			},
			{ kind: "bridge", originDecimals: 18, destinationDecimals: 6 },
		);
		expect(parsed.fees.gasUsd).toBe(2);
		expect(parsed.fees.relayerUsd).toBe(2);
		expect(parsed.fees.appUsd).toBe(0);
		expect(parsed.fees.totalUsd).toBe(4);
	});

	test('currency-formatted USD strings like "$1,234.56" are parsed', () => {
		const parsed = parseQuote(
			{
				fees: {
					gas: { amountUsd: "$1,234.56" },
					app: { amountUsd: "$10.00" },
				},
			},
			{ kind: "bridge", originDecimals: 18, destinationDecimals: 6 },
		);
		expect(parsed.fees.gasUsd).toBeCloseTo(1234.56, 2);
		expect(parsed.fees.appUsd).toBeCloseTo(10, 2);
		expect(parsed.fees.totalUsd).toBeCloseTo(1244.56, 2);
	});
});

describe("parseQuote - minimal / empty raw", () => {
	test("empty object returns zeros / empty strings without throwing", () => {
		const parsed = parseQuote(
			{},
			{ kind: "send", originDecimals: 18, destinationDecimals: 18 },
		);
		expect(parsed.kind).toBe("send");
		// operation falls back to kind when details.operation is absent
		expect(parsed.operation).toBe("send");
		expect(parsed.in.base).toBe("0");
		expect(parsed.out.base).toBe("0");
		// fromBaseUnits("0", n) -> "0"
		expect(parsed.in.amount).toBe("0");
		expect(parsed.out.amount).toBe("0");
		expect(parsed.in.usd).toBe(0);
		expect(parsed.out.usd).toBe(0);
		expect(parsed.rate).toBe(0);
		expect(parsed.slippagePercent).toBe(0);
		expect(parsed.timeEstimateSec).toBe(0);
		expect(parsed.fees.gasUsd).toBe(0);
		expect(parsed.fees.relayerUsd).toBe(0);
		expect(parsed.fees.appUsd).toBe(0);
		expect(parsed.fees.totalUsd).toBe(0);
	});

	test("raw of empty object is preserved by reference", () => {
		const raw = {};
		const parsed = parseQuote(raw, {
			kind: "swap",
			originDecimals: 6,
			destinationDecimals: 6,
		});
		expect(parsed.raw).toBe(raw);
	});

	test("missing fees object yields all-zero fees", () => {
		const parsed = parseQuote(
			{ details: { operation: "swap", rate: "2.5" } },
			{ kind: "swap", originDecimals: 18, destinationDecimals: 18 },
		);
		expect(parsed.fees.gasUsd).toBe(0);
		expect(parsed.fees.relayerUsd).toBe(0);
		expect(parsed.fees.appUsd).toBe(0);
		expect(parsed.fees.totalUsd).toBe(0);
	});
});

describe("parseQuote - amount derivation and fallbacks", () => {
	test("uses amountFormatted from currencyIn/currencyOut when present", () => {
		const parsed = parseQuote(
			{
				details: {
					currencyIn: {
						amount: "5000000000000000",
						amountFormatted: "0.005",
						amountUsd: "8.5",
					},
					currencyOut: {
						amount: "8494318",
						amountFormatted: "8.494318",
						amountUsd: "8.49",
					},
				},
			},
			{ kind: "bridge", originDecimals: 18, destinationDecimals: 6 },
		);
		expect(parsed.in.amount).toBe("0.005");
		expect(parsed.out.amount).toBe("8.494318");
		expect(parsed.in.usd).toBe(8.5);
		expect(parsed.out.usd).toBe(8.49);
	});

	test("falls back to fromBaseUnits when amountFormatted is absent", () => {
		const parsed = parseQuote(
			{
				details: {
					currencyIn: { amount: "1500000000000000000" },
					currencyOut: { amount: "2500000" },
				},
			},
			{ kind: "swap", originDecimals: 18, destinationDecimals: 6 },
		);
		// 1.5 ETH (18 decimals) and 2.5 USDC (6 decimals)
		expect(parsed.in.amount).toBe("1.5");
		expect(parsed.out.amount).toBe("2.5");
		expect(parsed.in.base).toBe("1500000000000000000");
		expect(parsed.out.base).toBe("2500000");
	});

	test("missing amount fields default base to '0' and amount to '0'", () => {
		const parsed = parseQuote(
			{ details: { currencyIn: {}, currencyOut: {} } },
			{ kind: "send", originDecimals: 18, destinationDecimals: 6 },
		);
		expect(parsed.in.base).toBe("0");
		expect(parsed.out.base).toBe("0");
		expect(parsed.in.amount).toBe("0");
		expect(parsed.out.amount).toBe("0");
	});

	test("operation defaults to ctx.kind when details.operation missing", () => {
		const parsed = parseQuote(
			{ details: {} },
			{ kind: "bridge", originDecimals: 18, destinationDecimals: 6 },
		);
		expect(parsed.operation).toBe("bridge");
	});

	test("operation uses details.operation when provided (overrides kind)", () => {
		const parsed = parseQuote(
			{ details: { operation: "wrap" } },
			{ kind: "swap", originDecimals: 18, destinationDecimals: 18 },
		);
		expect(parsed.operation).toBe("wrap");
	});
});

describe("parseQuote - numeric coercions and invalid inputs", () => {
	test("non-numeric rate coerces to 0", () => {
		const parsed = parseQuote(
			{ details: { rate: "not-a-number" } },
			{ kind: "swap", originDecimals: 18, destinationDecimals: 18 },
		);
		expect(parsed.rate).toBe(0);
	});

	test("rate of 0 stays 0 (Number('0') || 0)", () => {
		const parsed = parseQuote(
			{ details: { rate: "0" } },
			{ kind: "swap", originDecimals: 18, destinationDecimals: 18 },
		);
		expect(parsed.rate).toBe(0);
	});

	test("slippage destination percent parsed; missing -> 0", () => {
		const withSlip = parseQuote(
			{ details: { slippageTolerance: { destination: { percent: "0.5" } } } },
			{ kind: "swap", originDecimals: 18, destinationDecimals: 18 },
		);
		expect(withSlip.slippagePercent).toBe(0.5);

		const withoutSlip = parseQuote(
			{ details: {} },
			{ kind: "swap", originDecimals: 18, destinationDecimals: 18 },
		);
		expect(withoutSlip.slippagePercent).toBe(0);
	});

	test("timeEstimate parsed as number; missing -> 0", () => {
		const parsed = parseQuote(
			{ details: { timeEstimate: 42 } },
			{ kind: "bridge", originDecimals: 18, destinationDecimals: 6 },
		);
		expect(parsed.timeEstimateSec).toBe(42);
	});

	test("null raw does not throw (optional chaining guards)", () => {
		const parsed = parseQuote(
			null as unknown as Record<string, unknown>,
			{ kind: "send", originDecimals: 18, destinationDecimals: 18 },
		);
		expect(parsed.kind).toBe("send");
		expect(parsed.operation).toBe("send");
		expect(parsed.in.base).toBe("0");
		expect(parsed.out.base).toBe("0");
		expect(parsed.fees.totalUsd).toBe(0);
		expect(parsed.raw).toBeNull();
	});

	test("non-numeric usd amounts coerce to 0", () => {
		const parsed = parseQuote(
			{
				details: {
					currencyIn: { amount: "1000000", amountUsd: { weird: true } },
					currencyOut: { amount: "1000000", amountUsd: null },
				},
			},
			{ kind: "swap", originDecimals: 6, destinationDecimals: 6 },
		);
		expect(parsed.in.usd).toBe(0);
		expect(parsed.out.usd).toBe(0);
	});
});
