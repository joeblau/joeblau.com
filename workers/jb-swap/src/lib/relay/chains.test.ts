import { test, expect, describe, beforeEach } from "bun:test";
import { parseChain, fetchChains, clearChainsCache } from "./chains";
import { RelayApiError } from "./types";

const NATIVE = "0x0000000000000000000000000000000000000000";

/**
 * Build a minimal Response-like object for an injected fetchImpl. Cast to any so
 * we never need a real network round-trip.
 */
function mockResponse(opts: {
	ok?: boolean;
	status?: number;
	json?: unknown;
	jsonThrows?: boolean;
}): Response {
	return {
		ok: opts.ok ?? true,
		status: opts.status ?? 200,
		json: async () => {
			if (opts.jsonThrows) {
				throw new Error("invalid json");
			}
			return opts.json;
		},
	} as unknown as Response;
}

/** A fetchImpl that records how many times it was called and what response it returns. */
function countingFetch(response: Response) {
	const calls: string[] = [];
	const impl = (async (url: unknown) => {
		calls.push(String(url));
		return response;
	}) as unknown as typeof fetch;
	return { impl, calls };
}

describe("parseChain", () => {
	test("maps a full raw chain entry correctly", () => {
		const raw = {
			id: 1,
			name: "ethereum",
			displayName: "Ethereum",
			vmType: "evm",
			currency: {
				symbol: "ETH",
				decimals: 18,
				address: "0x1111111111111111111111111111111111111111",
			},
			iconUrl: "https://example.com/eth.png",
		};

		expect(parseChain(raw)).toEqual({
			id: 1,
			name: "ethereum",
			displayName: "Ethereum",
			vmType: "evm",
			currency: {
				symbol: "ETH",
				decimals: 18,
				address: "0x1111111111111111111111111111111111111111",
			},
			iconUrl: "https://example.com/eth.png",
		});
	});

	test("preserves a non-evm vmType verbatim", () => {
		const parsed = parseChain({
			id: 792703809,
			name: "solana",
			vmType: "svm",
		});
		expect(parsed.vmType).toBe("svm");
	});

	test("fills defaults for a sparse raw chain ({id,name})", () => {
		const parsed = parseChain({ id: 10, name: "optimism" });

		expect(parsed).toEqual({
			id: 10,
			name: "optimism",
			displayName: "optimism",
			vmType: "evm",
			currency: {
				symbol: "",
				decimals: 18,
				address: NATIVE,
			},
			iconUrl: undefined,
		});
	});

	test("displayName falls back to name when absent", () => {
		expect(parseChain({ id: 8453, name: "base" }).displayName).toBe("base");
	});

	test("name and displayName fall back to empty string when both missing", () => {
		const parsed = parseChain({ id: 5 });
		expect(parsed.name).toBe("");
		expect(parsed.displayName).toBe("");
	});

	test("vmType defaults to 'evm' when absent", () => {
		expect(parseChain({ id: 1, name: "ethereum" }).vmType).toBe("evm");
	});

	test("currency.decimals defaults to 18 and address to the native zero address", () => {
		const parsed = parseChain({
			id: 1,
			name: "ethereum",
			currency: { symbol: "ETH" },
		});
		expect(parsed.currency.decimals).toBe(18);
		expect(parsed.currency.address).toBe(NATIVE);
		expect(parsed.currency.symbol).toBe("ETH");
	});

	test("falls back to logoUrl when iconUrl is absent", () => {
		const parsed = parseChain({
			id: 1,
			name: "ethereum",
			logoUrl: "https://example.com/logo.png",
		});
		expect(parsed.iconUrl).toBe("https://example.com/logo.png");
	});

	test("prefers iconUrl over logoUrl when both are present", () => {
		const parsed = parseChain({
			id: 1,
			name: "ethereum",
			iconUrl: "https://example.com/icon.png",
			logoUrl: "https://example.com/logo.png",
		});
		expect(parsed.iconUrl).toBe("https://example.com/icon.png");
	});

	test("iconUrl is undefined when neither iconUrl nor logoUrl present", () => {
		expect(parseChain({ id: 1, name: "ethereum" }).iconUrl).toBeUndefined();
	});

	test("coerces a string id to a number", () => {
		const parsed = parseChain({ id: "137", name: "polygon" });
		expect(parsed.id).toBe(137);
		expect(typeof parsed.id).toBe("number");
	});

	test("produces NaN id for a non-numeric id (filtered downstream)", () => {
		const parsed = parseChain({ id: "not-a-number", name: "weird" });
		expect(Number.isNaN(parsed.id)).toBe(true);
	});

	test("produces NaN id when id is missing entirely", () => {
		const parsed = parseChain({ name: "noid" });
		expect(Number.isNaN(parsed.id)).toBe(true);
	});

	test("coerces non-string name/displayName/symbol/address values to strings", () => {
		const parsed = parseChain({
			id: 1,
			name: 123,
			displayName: 456,
			currency: { symbol: 789, decimals: "6", address: 0 },
		});
		expect(parsed.name).toBe("123");
		expect(parsed.displayName).toBe("456");
		expect(parsed.currency.symbol).toBe("789");
		expect(parsed.currency.decimals).toBe(6);
		expect(parsed.currency.address).toBe("0");
	});

	test("treats a missing currency object as an empty currency with defaults", () => {
		const parsed = parseChain({ id: 1, name: "ethereum" });
		expect(parsed.currency).toEqual({
			symbol: "",
			decimals: 18,
			address: NATIVE,
		});
	});
});

describe("fetchChains", () => {
	beforeEach(() => {
		// Ensure each test starts from a cold cache.
		clearChainsCache();
	});

	test("parses the { chains: [...] } envelope form", async () => {
		const { impl, calls } = countingFetch(
			mockResponse({
				ok: true,
				json: {
					chains: [
						{
							id: 1,
							name: "ethereum",
							displayName: "Ethereum",
							currency: { symbol: "ETH", decimals: 18, address: NATIVE },
						},
					],
				},
			}),
		);

		const result = await fetchChains({ fetchImpl: impl });

		expect(calls.length).toBe(1);
		expect(calls[0]).toBe("https://api.relay.link/chains");
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe(1);
		expect(result[0].displayName).toBe("Ethereum");
	});

	test("parses the bare-array form", async () => {
		const { impl } = countingFetch(
			mockResponse({
				ok: true,
				json: [
					{ id: 1, name: "ethereum" },
					{ id: 10, name: "optimism" },
				],
			}),
		);

		const result = await fetchChains({ fetchImpl: impl });

		expect(result).toHaveLength(2);
		expect(result.map((c) => c.id)).toEqual([1, 10]);
		expect(result[1].name).toBe("optimism");
	});

	test("filters out entries with non-numeric (NaN) ids", async () => {
		const { impl } = countingFetch(
			mockResponse({
				ok: true,
				json: {
					chains: [
						{ id: 1, name: "ethereum" },
						{ id: "bogus", name: "broken" },
						{ name: "missing-id" },
						{ id: 137, name: "polygon" },
					],
				},
			}),
		);

		const result = await fetchChains({ fetchImpl: impl });

		expect(result.map((c) => c.id)).toEqual([1, 137]);
	});

	test("returns an empty array when the envelope has no chains key", async () => {
		const { impl } = countingFetch(mockResponse({ ok: true, json: {} }));
		const result = await fetchChains({ fetchImpl: impl });
		expect(result).toEqual([]);
	});

	test("returns an empty array for an empty bare array", async () => {
		const { impl } = countingFetch(mockResponse({ ok: true, json: [] }));
		const result = await fetchChains({ fetchImpl: impl });
		expect(result).toEqual([]);
	});

	test("normalizes sparse chains via parseChain defaults", async () => {
		const { impl } = countingFetch(
			mockResponse({ ok: true, json: { chains: [{ id: 8453, name: "base" }] } }),
		);

		const [chain] = await fetchChains({ fetchImpl: impl });

		expect(chain).toEqual({
			id: 8453,
			name: "base",
			displayName: "base",
			vmType: "evm",
			currency: { symbol: "", decimals: 18, address: NATIVE },
			iconUrl: undefined,
		});
	});

	test("caches results: a second call within the TTL does not re-fetch", async () => {
		const { impl, calls } = countingFetch(
			mockResponse({ ok: true, json: { chains: [{ id: 1, name: "ethereum" }] } }),
		);

		const first = await fetchChains({ fetchImpl: impl });
		expect(calls.length).toBe(1);

		const second = await fetchChains({ fetchImpl: impl });
		// Still only one underlying fetch — served from cache.
		expect(calls.length).toBe(1);
		// Cache returns the exact same data reference.
		expect(second).toBe(first);
	});

	test("force:true bypasses the cache and re-fetches", async () => {
		const { impl, calls } = countingFetch(
			mockResponse({ ok: true, json: { chains: [{ id: 1, name: "ethereum" }] } }),
		);

		await fetchChains({ fetchImpl: impl });
		expect(calls.length).toBe(1);

		await fetchChains({ fetchImpl: impl, force: true });
		expect(calls.length).toBe(2);
	});

	test("clearChainsCache forces the next call to re-fetch", async () => {
		const { impl, calls } = countingFetch(
			mockResponse({ ok: true, json: { chains: [{ id: 1, name: "ethereum" }] } }),
		);

		await fetchChains({ fetchImpl: impl });
		expect(calls.length).toBe(1);

		await fetchChains({ fetchImpl: impl });
		expect(calls.length).toBe(1);

		clearChainsCache();

		await fetchChains({ fetchImpl: impl });
		expect(calls.length).toBe(2);
	});

	test("throws RelayApiError on a non-ok response", async () => {
		const { impl } = countingFetch(
			mockResponse({ ok: false, status: 500, json: { error: "boom" } }),
		);

		expect(fetchChains({ fetchImpl: impl })).rejects.toThrow(RelayApiError);
	});

	test("RelayApiError carries the status and parsed body", async () => {
		const { impl } = countingFetch(
			mockResponse({ ok: false, status: 503, json: { error: "down" } }),
		);

		try {
			await fetchChains({ fetchImpl: impl });
			throw new Error("expected fetchChains to throw");
		} catch (err) {
			expect(err).toBeInstanceOf(RelayApiError);
			const e = err as RelayApiError;
			expect(e.status).toBe(503);
			expect(e.body).toEqual({ error: "down" });
			expect(e.message).toBe("GET /chains failed");
		}
	});

	test("non-ok response with an unparseable body yields undefined body", async () => {
		const { impl } = countingFetch(
			mockResponse({ ok: false, status: 502, jsonThrows: true }),
		);

		try {
			await fetchChains({ fetchImpl: impl });
			throw new Error("expected fetchChains to throw");
		} catch (err) {
			expect(err).toBeInstanceOf(RelayApiError);
			const e = err as RelayApiError;
			expect(e.status).toBe(502);
			expect(e.body).toBeUndefined();
		}
	});

	test("a failed (non-ok) fetch does not populate the cache", async () => {
		const failing = countingFetch(
			mockResponse({ ok: false, status: 500, json: { error: "boom" } }),
		);
		await expect(fetchChains({ fetchImpl: failing.impl })).rejects.toThrow(
			RelayApiError,
		);

		// A subsequent successful call must hit fetch again (nothing was cached).
		const ok = countingFetch(
			mockResponse({ ok: true, json: { chains: [{ id: 1, name: "ethereum" }] } }),
		);
		const result = await fetchChains({ fetchImpl: ok.impl });
		expect(ok.calls.length).toBe(1);
		expect(result).toHaveLength(1);
	});
});
