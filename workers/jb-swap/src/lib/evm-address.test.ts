import { test, expect, describe } from "bun:test";
import {
	normalizeEvmAddress,
	isValidEvmAddress,
	extractEvmAddress,
} from "./evm-address";

// A canonical lowercase 40-hex address used across the tests.
const LOWER = "0x" + "ab".repeat(20); // 0xababab...ab (40 hex chars)
const MIXED = "0xAbAbAbAbAbAbAbAbAbAbAbAbAbAbAbAbAbAbAbAb";
const UPPER = "0xABABABABABABABABABABABABABABABABABABABAB";

describe("normalizeEvmAddress", () => {
	test("accepts a bare lowercase 0x + 40 hex address and returns it lowercased", () => {
		expect(normalizeEvmAddress(LOWER)).toBe(LOWER);
	});

	test("lowercases a checksum / mixed-case address", () => {
		expect(normalizeEvmAddress(MIXED)).toBe(LOWER);
	});

	test("lowercases an all-uppercase hex address", () => {
		expect(normalizeEvmAddress(UPPER)).toBe(LOWER);
	});

	test("trims surrounding whitespace before validating", () => {
		expect(normalizeEvmAddress(`  ${MIXED}\n\t`)).toBe(LOWER);
	});

	test("returns null for an address that is too short (39 hex)", () => {
		expect(normalizeEvmAddress("0x" + "a".repeat(39))).toBeNull();
	});

	test("returns null for an address that is too long (41 hex)", () => {
		expect(normalizeEvmAddress("0x" + "a".repeat(41))).toBeNull();
	});

	test("returns null for non-hex characters in the body", () => {
		// 'g' is not a valid hex digit.
		expect(normalizeEvmAddress("0x" + "g".repeat(40))).toBeNull();
	});

	test("returns null when the 0x prefix is missing", () => {
		expect(normalizeEvmAddress("a".repeat(40))).toBeNull();
	});

	test("returns null when there is trailing garbage after a valid address", () => {
		// STRICT_HEX_ADDRESS is anchored, so embedded matches don't count.
		expect(normalizeEvmAddress(`${LOWER}deadbeef`)).toBeNull();
		expect(normalizeEvmAddress(`pay ${LOWER}`)).toBeNull();
	});

	test("returns null for an empty string", () => {
		expect(normalizeEvmAddress("")).toBeNull();
		expect(normalizeEvmAddress("   ")).toBeNull();
	});

	test("returns null for arbitrary garbage", () => {
		expect(normalizeEvmAddress("not-an-address")).toBeNull();
	});
});

describe("isValidEvmAddress", () => {
	test("is true for a valid lowercase address", () => {
		expect(isValidEvmAddress(LOWER)).toBe(true);
	});

	test("is true for a valid mixed-case address", () => {
		expect(isValidEvmAddress(MIXED)).toBe(true);
	});

	test("is true for a valid address with surrounding whitespace", () => {
		expect(isValidEvmAddress(`  ${LOWER}  `)).toBe(true);
	});

	test("is false for a too-short address", () => {
		expect(isValidEvmAddress("0x" + "a".repeat(10))).toBe(false);
	});

	test("is false for non-hex content", () => {
		expect(isValidEvmAddress("0x" + "z".repeat(40))).toBe(false);
	});

	test("is false for an embedded (non-anchored) address", () => {
		expect(isValidEvmAddress(`text ${LOWER}`)).toBe(false);
	});

	test("is false for an empty string", () => {
		expect(isValidEvmAddress("")).toBe(false);
	});
});

describe("extractEvmAddress — direct hex (strategy 1)", () => {
	test("extracts a bare lowercase address", () => {
		expect(extractEvmAddress(LOWER)).toBe(LOWER);
	});

	test("extracts and lowercases a mixed-case address", () => {
		expect(extractEvmAddress(MIXED)).toBe(LOWER);
	});

	test("trims whitespace around a bare address", () => {
		expect(extractEvmAddress(`\n  ${UPPER}  \t`)).toBe(LOWER);
	});

	test("returns null for empty / whitespace-only input", () => {
		expect(extractEvmAddress("")).toBeNull();
		expect(extractEvmAddress("    ")).toBeNull();
	});
});

describe("extractEvmAddress — EIP-681 ethereum: URI (strategy 2)", () => {
	test("extracts from ethereum:<address>@<chainId>", () => {
		expect(extractEvmAddress(`ethereum:${MIXED}@1`)).toBe(LOWER);
	});

	test("extracts from ethereum:pay-<address>@<chainId>", () => {
		expect(extractEvmAddress(`ethereum:pay-${MIXED}@1`)).toBe(LOWER);
	});

	test("extracts from a pay-<address>@<chainId>/transfer?args form, keeping only the target", () => {
		const uri = `ethereum:pay-${UPPER}@137/transfer?value=1e18&address=0x${"c".repeat(40)}`;
		expect(extractEvmAddress(uri)).toBe(LOWER);
	});

	test("extracts from ethereum:<address> with a /function suffix", () => {
		expect(extractEvmAddress(`ethereum:${LOWER}/transfer`)).toBe(LOWER);
	});

	test("is case-insensitive on the scheme and pay- prefix", () => {
		expect(extractEvmAddress(`ETHEREUM:PAY-${MIXED}@1`)).toBe(LOWER);
	});

	test("extracts a bare ethereum:<address> with no chain or function", () => {
		expect(extractEvmAddress(`ethereum:${LOWER}`)).toBe(LOWER);
	});

	test("returns null when the ethereum: target is not a valid address", () => {
		expect(extractEvmAddress("ethereum:pay-notanaddress@1")).toBeNull();
	});
});

describe("extractEvmAddress — URL strategies (strategy 3)", () => {
	test("extracts from a recognized query parameter", () => {
		expect(
			extractEvmAddress(`https://example.com/send?recipient=${MIXED}`),
		).toBe(LOWER);
	});

	test("extracts from the 'address' query parameter", () => {
		expect(extractEvmAddress(`https://example.com/?address=${UPPER}`)).toBe(
			LOWER,
		);
	});

	test("extracts from the 'to' query parameter (case-insensitive key)", () => {
		expect(extractEvmAddress(`https://example.com/?TO=${LOWER}`)).toBe(LOWER);
	});

	test("extracts from snake_case wallet_address parameter", () => {
		expect(
			extractEvmAddress(`https://example.com/x?wallet_address=${MIXED}`),
		).toBe(LOWER);
	});

	test("extracts an address embedded inside a recognized query value", () => {
		// value is not itself a bare address, so it falls back to extractEvmAddress
		// recursively which finds it via the regex pattern.
		expect(
			extractEvmAddress(
				`https://example.com/?recipient=pay-${MIXED}-now`,
			),
		).toBe(LOWER);
	});

	test("extracts from a hash fragment query string", () => {
		expect(
			extractEvmAddress(`https://example.com/app#?recipient=${MIXED}`),
		).toBe(LOWER);
	});

	test("extracts from a hash fragment without a leading ?", () => {
		expect(
			extractEvmAddress(`https://example.com/app#recipient=${LOWER}`),
		).toBe(LOWER);
	});

	test("extracts from a path segment when no query matches", () => {
		expect(extractEvmAddress(`https://example.com/wallet/${MIXED}`)).toBe(
			LOWER,
		);
	});

	test("ignores unrecognized query keys but still finds a path segment", () => {
		expect(
			extractEvmAddress(`https://example.com/u/${UPPER}?ref=marketing`),
		).toBe(LOWER);
	});

	test("falls through to regex when a URL has the address in an unrecognized query only", () => {
		// 'foo' is not a recognized field, but the regex fallback scans the whole string.
		expect(extractEvmAddress(`https://example.com/?foo=${MIXED}`)).toBe(
			LOWER,
		);
	});
});

describe("extractEvmAddress — regex fallback (strategy 4)", () => {
	test("plucks an address out of free-form text", () => {
		expect(
			extractEvmAddress(`Pay: ${MIXED} on Arbitrum please`),
		).toBe(LOWER);
	});

	test("finds the first valid address when multiple substrings appear", () => {
		const second = "0x" + "cd".repeat(20);
		expect(extractEvmAddress(`first ${LOWER} then ${second}`)).toBe(LOWER);
	});

	test("skips a too-short hex run and finds a later valid address", () => {
		// 0x + 10 hex is not a match for the {40} pattern; the real one follows.
		expect(extractEvmAddress(`junk 0x${"a".repeat(10)} ${MIXED}`)).toBe(
			LOWER,
		);
	});

	test("extracts from text containing a non-URL ethereum-ish phrase", () => {
		expect(extractEvmAddress(`send to wallet ${UPPER}`)).toBe(LOWER);
	});
});

describe("extractEvmAddress — garbage returns null", () => {
	test("returns null for plain garbage text", () => {
		expect(extractEvmAddress("this is not an address at all")).toBeNull();
	});

	test("returns null for a URL with no address anywhere", () => {
		expect(
			extractEvmAddress("https://example.com/path?ref=abc#section"),
		).toBeNull();
	});

	test("returns null for a hex string that is too short to be an address", () => {
		expect(extractEvmAddress("0x" + "a".repeat(20))).toBeNull();
	});

	test("returns null for an empty string", () => {
		expect(extractEvmAddress("")).toBeNull();
	});

	test("returns null for whitespace only", () => {
		expect(extractEvmAddress("   \n\t  ")).toBeNull();
	});

	test("returns null for an ethereum: URI whose target is garbage and contains no other address", () => {
		expect(extractEvmAddress("ethereum:pay-deadbeef@1")).toBeNull();
	});
});
