import { test, expect, describe } from "bun:test";
import {
	parseCurrency,
	flattenCurrencies,
	searchCurrencies,
	getTokenPrice,
} from "./currencies";
import { RELAY_API_BASE, RelayApiError } from "./types";

/** Build a mock Response-like object cast to `any` to satisfy fetch's typing. */
function mockResponse(opts: {
	ok?: boolean;
	status?: number;
	json?: unknown;
	throwOnJson?: boolean;
}) {
	const { ok = true, status = 200, json, throwOnJson = false } = opts;
	return {
		ok,
		status,
		json: async () => {
			if (throwOnJson) throw new Error("invalid json");
			return json;
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} as any;
}

describe("parseCurrency", () => {
	test("parses a fully-populated raw entry", () => {
		const raw = {
			chainId: 1,
			address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
			symbol: "USDC",
			name: "USD Coin",
			decimals: 6,
			metadata: { logoURI: "https://example.com/usdc.png", name: "USD Coin Meta" },
			vmType: "evm",
		};
		const result = parseCurrency(raw);
		expect(result).toEqual({
			chainId: 1,
			address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
			symbol: "USDC",
			name: "USD Coin",
			decimals: 6,
			logoUrl: "https://example.com/usdc.png",
			vmType: "evm",
		});
	});

	test("applies sparse defaults when fields are missing", () => {
		const result = parseCurrency({});
		expect(result.chainId).toBeNaN();
		expect(result.address).toBe("");
		expect(result.symbol).toBe("");
		expect(result.name).toBe("");
		expect(result.decimals).toBe(18);
		expect(result.logoUrl).toBeUndefined();
		expect(result.vmType).toBeUndefined();
	});

	test("defaults decimals to 18 when not provided", () => {
		const result = parseCurrency({ chainId: 1, address: "0xabc", symbol: "FOO" });
		expect(result.decimals).toBe(18);
	});

	test("derives logoUrl from metadata.logoURI", () => {
		const result = parseCurrency({
			chainId: 1,
			address: "0xabc",
			metadata: { logoURI: "https://example.com/from-metadata.png" },
		});
		expect(result.logoUrl).toBe("https://example.com/from-metadata.png");
	});

	test("falls back to top-level logoURI when metadata has none", () => {
		const result = parseCurrency({
			chainId: 1,
			address: "0xabc",
			logoURI: "https://example.com/from-top.png",
		});
		expect(result.logoUrl).toBe("https://example.com/from-top.png");
	});

	test("prefers metadata.logoURI over top-level logoURI", () => {
		const result = parseCurrency({
			chainId: 1,
			address: "0xabc",
			logoURI: "https://example.com/top.png",
			metadata: { logoURI: "https://example.com/meta.png" },
		});
		expect(result.logoUrl).toBe("https://example.com/meta.png");
	});

	test("name falls back to metadata.name when name is absent", () => {
		const result = parseCurrency({
			chainId: 1,
			address: "0xabc",
			symbol: "FOO",
			metadata: { name: "Foo Token" },
		});
		expect(result.name).toBe("Foo Token");
	});

	test("name falls back to symbol when name and metadata.name are absent", () => {
		const result = parseCurrency({
			chainId: 1,
			address: "0xabc",
			symbol: "BAR",
		});
		expect(result.name).toBe("BAR");
	});

	test("name is empty string when name, metadata.name, and symbol are all absent", () => {
		const result = parseCurrency({ chainId: 1, address: "0xabc" });
		expect(result.name).toBe("");
	});

	test("coerces string chainId and decimals to numbers", () => {
		const result = parseCurrency({
			chainId: "137",
			address: "0xabc",
			decimals: "9",
		});
		expect(result.chainId).toBe(137);
		expect(result.decimals).toBe(9);
	});

	test("preserves vmType passthrough", () => {
		const result = parseCurrency({ chainId: 1, address: "0xabc", vmType: "svm" });
		expect(result.vmType).toBe("svm");
	});
});

describe("flattenCurrencies", () => {
	const valid = {
		chainId: 1,
		address: "0xabc",
		symbol: "AAA",
		metadata: { logoURI: "https://example.com/a.png" },
	};

	test("flattens a nested array-of-arrays", () => {
		const json = [
			[valid, { chainId: 10, address: "0xdef", symbol: "BBB" }],
			[{ chainId: 137, address: "0xghi", symbol: "CCC" }],
		];
		const result = flattenCurrencies(json);
		expect(result).toHaveLength(3);
		expect(result.map((c) => c.symbol)).toEqual(["AAA", "BBB", "CCC"]);
	});

	test("flattens a flat array of currency objects", () => {
		const json = [valid, { chainId: 10, address: "0xdef", symbol: "BBB" }];
		const result = flattenCurrencies(json);
		expect(result).toHaveLength(2);
		expect(result[0].address).toBe("0xabc");
	});

	test("flattens a { currencies: [...] } wrapper object", () => {
		const json = { currencies: [valid, { chainId: 10, address: "0xdef", symbol: "BBB" }] };
		const result = flattenCurrencies(json);
		expect(result).toHaveLength(2);
		expect(result.map((c) => c.symbol)).toEqual(["AAA", "BBB"]);
	});

	test("flattens a { currencies: [[...]] } wrapper of nested arrays", () => {
		const json = { currencies: [[valid], [{ chainId: 10, address: "0xdef", symbol: "BBB" }]] };
		const result = flattenCurrencies(json);
		expect(result).toHaveLength(2);
		expect(result.map((c) => c.symbol)).toEqual(["AAA", "BBB"]);
	});

	test("filters out rows missing an address", () => {
		const json = [valid, { chainId: 10, symbol: "NOADDR" }];
		const result = flattenCurrencies(json);
		expect(result).toHaveLength(1);
		expect(result[0].symbol).toBe("AAA");
	});

	test("filters out rows missing a chainId (NaN chainId)", () => {
		const json = [valid, { address: "0xnochainid", symbol: "NOCHAIN" }];
		const result = flattenCurrencies(json);
		expect(result).toHaveLength(1);
		expect(result[0].symbol).toBe("AAA");
	});

	test("filters out rows whose chainId is non-finite", () => {
		const json = [valid, { chainId: "not-a-number", address: "0xbad", symbol: "BAD" }];
		const result = flattenCurrencies(json);
		expect(result).toHaveLength(1);
		expect(result[0].symbol).toBe("AAA");
	});

	test("returns an empty array for an empty input array", () => {
		expect(flattenCurrencies([])).toEqual([]);
	});

	test("returns an empty array when currencies key is missing", () => {
		expect(flattenCurrencies({})).toEqual([]);
	});

	test("returns an empty array for null/undefined input", () => {
		expect(flattenCurrencies(null)).toEqual([]);
		expect(flattenCurrencies(undefined)).toEqual([]);
	});

	test("parses currency fields while flattening", () => {
		const result = flattenCurrencies([valid]);
		expect(result[0].logoUrl).toBe("https://example.com/a.png");
		expect(result[0].decimals).toBe(18);
	});
});

describe("searchCurrencies", () => {
	test("POSTs to /currencies/v2 with the expected JSON body and parses currencies", async () => {
		let capturedUrl: string | undefined;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let capturedInit: any;
		const fetchImpl = (async (url: string, init: unknown) => {
			capturedUrl = url;
			capturedInit = init;
			return mockResponse({
				json: { currencies: [{ chainId: 1, address: "0xabc", symbol: "AAA" }] },
			});
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		}) as any;

		const result = await searchCurrencies(
			{ term: "usdc", chainIds: [1, 10], limit: 5 },
			fetchImpl,
		);

		expect(capturedUrl).toBe(`${RELAY_API_BASE}/currencies/v2`);
		expect(capturedInit.method).toBe("POST");
		expect(capturedInit.headers).toEqual({ "Content-Type": "application/json" });

		const body = JSON.parse(capturedInit.body);
		expect(body).toEqual({ limit: 5, term: "usdc", chainIds: [1, 10] });

		expect(result).toHaveLength(1);
		expect(result[0].symbol).toBe("AAA");
	});

	test("defaults limit to 20 when not supplied", async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let capturedInit: any;
		const fetchImpl = (async (_url: string, init: unknown) => {
			capturedInit = init;
			return mockResponse({ json: { currencies: [] } });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		}) as any;

		await searchCurrencies({}, fetchImpl);
		expect(JSON.parse(capturedInit.body)).toEqual({ limit: 20 });
	});

	test("omits term/chainIds/address when not provided", async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let capturedInit: any;
		const fetchImpl = (async (_url: string, init: unknown) => {
			capturedInit = init;
			return mockResponse({ json: { currencies: [] } });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		}) as any;

		await searchCurrencies({ limit: 3 }, fetchImpl);
		const body = JSON.parse(capturedInit.body);
		expect(body).toEqual({ limit: 3 });
		expect(body).not.toHaveProperty("term");
		expect(body).not.toHaveProperty("chainIds");
		expect(body).not.toHaveProperty("address");
		expect(body).not.toHaveProperty("defaultList");
	});

	test("includes address in the body when provided", async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let capturedInit: any;
		const fetchImpl = (async (_url: string, init: unknown) => {
			capturedInit = init;
			return mockResponse({ json: { currencies: [] } });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		}) as any;

		await searchCurrencies({ address: "0xfeed" }, fetchImpl);
		expect(JSON.parse(capturedInit.body)).toEqual({ limit: 20, address: "0xfeed" });
	});

	test("includes defaultList:true when defaultList is set", async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let capturedInit: any;
		const fetchImpl = (async (_url: string, init: unknown) => {
			capturedInit = init;
			return mockResponse({ json: { currencies: [] } });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		}) as any;

		await searchCurrencies({ defaultList: true }, fetchImpl);
		expect(JSON.parse(capturedInit.body)).toEqual({ limit: 20, defaultList: true });
	});

	test("omits defaultList when defaultList is false", async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let capturedInit: any;
		const fetchImpl = (async (_url: string, init: unknown) => {
			capturedInit = init;
			return mockResponse({ json: { currencies: [] } });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		}) as any;

		await searchCurrencies({ defaultList: false }, fetchImpl);
		expect(JSON.parse(capturedInit.body)).not.toHaveProperty("defaultList");
	});

	test("flattens a nested array-of-arrays response", async () => {
		const fetchImpl = (async () =>
			mockResponse({
				json: {
					currencies: [
						[{ chainId: 1, address: "0xa", symbol: "A" }],
						[{ chainId: 10, address: "0xb", symbol: "B" }],
					],
				},
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			})) as any;

		const result = await searchCurrencies({}, fetchImpl);
		expect(result.map((c) => c.symbol)).toEqual(["A", "B"]);
	});

	test("throws RelayApiError with status and body when response is not ok", async () => {
		const fetchImpl = (async () =>
			mockResponse({ ok: false, status: 503, json: { error: "down" } })) as // eslint-disable-next-line @typescript-eslint/no-explicit-any
			any;

		let caught: unknown;
		try {
			await searchCurrencies({ term: "x" }, fetchImpl);
		} catch (e) {
			caught = e;
		}
		expect(caught).toBeInstanceOf(RelayApiError);
		const err = caught as RelayApiError;
		expect(err.status).toBe(503);
		expect(err.message).toBe("POST /currencies/v2 failed");
		expect(err.body).toEqual({ error: "down" });
	});

	test("RelayApiError body is undefined when error response json() throws", async () => {
		const fetchImpl = (async () =>
			mockResponse({ ok: false, status: 500, throwOnJson: true })) as // eslint-disable-next-line @typescript-eslint/no-explicit-any
			any;

		let caught: unknown;
		try {
			await searchCurrencies({}, fetchImpl);
		} catch (e) {
			caught = e;
		}
		expect(caught).toBeInstanceOf(RelayApiError);
		expect((caught as RelayApiError).body).toBeUndefined();
		expect((caught as RelayApiError).status).toBe(500);
	});
});

describe("getTokenPrice", () => {
	test("returns the numeric price from { price: 1658.95 }", async () => {
		const fetchImpl = (async () => mockResponse({ json: { price: 1658.95 } })) as // eslint-disable-next-line @typescript-eslint/no-explicit-any
			any;
		const price = await getTokenPrice(1, "0xabc", fetchImpl);
		expect(price).toBe(1658.95);
	});

	test("builds the correct URL with encoded address and chainId", async () => {
		let capturedUrl: string | undefined;
		const fetchImpl = (async (url: string) => {
			capturedUrl = url;
			return mockResponse({ json: { price: 1 } });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		}) as any;

		await getTokenPrice(137, "0xAbC dEf", fetchImpl);
		expect(capturedUrl).toBe(
			`${RELAY_API_BASE}/currencies/token/price?address=${encodeURIComponent(
				"0xAbC dEf",
			)}&chainId=137`,
		);
		expect(capturedUrl).toContain("address=0xAbC%20dEf");
		expect(capturedUrl).toContain("chainId=137");
	});

	test("returns 0 when price is missing", async () => {
		const fetchImpl = (async () => mockResponse({ json: {} })) as // eslint-disable-next-line @typescript-eslint/no-explicit-any
			any;
		expect(await getTokenPrice(1, "0xabc", fetchImpl)).toBe(0);
	});

	test("returns 0 when price is non-finite (NaN / non-numeric string)", async () => {
		const fetchImpl = (async () => mockResponse({ json: { price: "not-a-number" } })) as // eslint-disable-next-line @typescript-eslint/no-explicit-any
			any;
		expect(await getTokenPrice(1, "0xabc", fetchImpl)).toBe(0);
	});

	test("returns 0 when price is null", async () => {
		const fetchImpl = (async () => mockResponse({ json: { price: null } })) as // eslint-disable-next-line @typescript-eslint/no-explicit-any
			any;
		expect(await getTokenPrice(1, "0xabc", fetchImpl)).toBe(0);
	});

	test("coerces a numeric string price to a number", async () => {
		const fetchImpl = (async () => mockResponse({ json: { price: "42.5" } })) as // eslint-disable-next-line @typescript-eslint/no-explicit-any
			any;
		expect(await getTokenPrice(1, "0xabc", fetchImpl)).toBe(42.5);
	});

	test("throws RelayApiError when the response is not ok", async () => {
		const fetchImpl = (async () =>
			mockResponse({ ok: false, status: 404, json: { error: "missing" } })) as // eslint-disable-next-line @typescript-eslint/no-explicit-any
			any;

		let caught: unknown;
		try {
			await getTokenPrice(1, "0xabc", fetchImpl);
		} catch (e) {
			caught = e;
		}
		expect(caught).toBeInstanceOf(RelayApiError);
		const err = caught as RelayApiError;
		expect(err.status).toBe(404);
		expect(err.message).toBe("GET token price failed");
		expect(err.body).toEqual({ error: "missing" });
	});

	test("RelayApiError body is undefined when error response json() throws", async () => {
		const fetchImpl = (async () =>
			mockResponse({ ok: false, status: 502, throwOnJson: true })) as // eslint-disable-next-line @typescript-eslint/no-explicit-any
			any;

		let caught: unknown;
		try {
			await getTokenPrice(1, "0xabc", fetchImpl);
		} catch (e) {
			caught = e;
		}
		expect(caught).toBeInstanceOf(RelayApiError);
		expect((caught as RelayApiError).body).toBeUndefined();
	});
});
