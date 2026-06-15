import { describe, expect, test } from "bun:test";

import {
	RELAY_TOKEN_LIST,
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
});
