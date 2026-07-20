import { describe, expect, test } from "bun:test";

import {
	pinPriorityChains,
	RELAY_TOKEN_LIST,
	relayChains,
	relayTokens,
	toTokenRow,
	type UniswapToken,
} from "./token-list";

describe("relay token list", () => {
	test("is a valid Uniswap-shaped list", () => {
		expect(RELAY_TOKEN_LIST.name).toBeTruthy();
		expect(typeof RELAY_TOKEN_LIST.timestamp).toBe("string");
		expect(typeof RELAY_TOKEN_LIST.version.major).toBe("number");
		expect(Array.isArray(RELAY_TOKEN_LIST.tokens)).toBe(true);
		expect(RELAY_TOKEN_LIST.tokens.length).toBeGreaterThan(100);
	});

	test("every token has the required fields", () => {
		for (const t of RELAY_TOKEN_LIST.tokens) {
			expect(typeof t.chainId).toBe("number");
			expect(Number.isFinite(t.chainId)).toBe(true);
			expect(typeof t.address).toBe("string");
			expect(t.address.length).toBeGreaterThan(0);
			expect(typeof t.symbol).toBe("string");
			expect(t.symbol.length).toBeGreaterThan(0);
			expect(typeof t.decimals).toBe("number");
			expect(t.decimals).toBeGreaterThanOrEqual(0);
		}
	});

	test("toTokenRow maps a Uniswap token to a TokenRow", () => {
		const sample: UniswapToken = {
			chainId: 8453,
			address: "0xabc",
			name: "Test",
			symbol: "TST",
			decimals: 6,
			logoURI: "https://example/logo.png",
			extensions: { vmType: "evm", verified: true, chainName: "Base" },
		};
		expect(toTokenRow(sample)).toMatchObject({
			chainId: 8453,
			address: "0xabc",
			name: "Test",
			symbol: "TST",
			decimals: 6,
			chain: "Base",
			logo: "https://example/logo.png",
			vmType: "evm",
			amount: "0",
			usd: "$0",
		});
	});

	test("svm vmType + fallbacks for missing chainName/logo", () => {
		const svm = toTokenRow({
			chainId: 792703809,
			address: "So111",
			name: "SOL",
			symbol: "SOL",
			decimals: 9,
			extensions: { vmType: "svm" },
		});
		expect(svm.vmType).toBe("svm");
		expect(svm.chain).toBe("792703809");
		expect(svm.logo).toContain("assets.relay.link/icons/792703809");
	});

	test("relayTokens derives 1:1 from the list with zeroed holdings", () => {
		expect(relayTokens.length).toBe(RELAY_TOKEN_LIST.tokens.length);
		expect(relayTokens.every((r) => r.amount === "0" && r.usd === "$0")).toBe(true);
	});

	test("Robinhood Chain is present in the generated list", () => {
		const robinhood = relayChains.find((c) => c.chainId === 4663);
		expect(robinhood?.name).toBe("Robinhood Chain");
	});
});

describe("pinPriorityChains", () => {
	const opt = (chainId: number) => ({ chainId, name: `c${chainId}`, icon: "" });

	test("lifts pinned chains to the front in CHAIN_PRIORITY order", () => {
		// Deliberately reversed: pinned chains must be reordered, not just moved.
		const out = pinPriorityChains([opt(999), opt(4663), opt(8453), opt(1)]);
		expect(out.map((c) => c.chainId)).toEqual([1, 8453, 4663, 999]);
	});

	test("preserves the incoming order of unpinned chains", () => {
		const out = pinPriorityChains([opt(777), opt(999), opt(888), opt(1)]);
		expect(out.map((c) => c.chainId)).toEqual([1, 777, 999, 888]);
	});

	test("skips pinned chains absent from the input", () => {
		const out = pinPriorityChains([opt(8453), opt(999)]);
		expect(out.map((c) => c.chainId)).toEqual([8453, 999]);
	});

	test("survives a volume sort that would otherwise bury a pinned chain", () => {
		// Simulates post-hydration ranking: Robinhood dead last by volume.
		const ranked = [opt(999), opt(888), opt(1), opt(4663)];
		expect(pinPriorityChains(ranked).map((c) => c.chainId)).toEqual([
			1, 4663, 999, 888,
		]);
	});

	test("returns a new array and does not mutate the input", () => {
		const input = [opt(999), opt(1)];
		const out = pinPriorityChains(input);
		expect(out).not.toBe(input);
		expect(input.map((c) => c.chainId)).toEqual([999, 1]);
	});
});
