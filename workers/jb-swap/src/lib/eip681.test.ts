import { test, expect, describe } from "bun:test";
import {
	isEvmAddress,
	buildEip681Uri,
	buildPaymentPayload,
	type PaymentRequest,
} from "./eip681";

const EVM_ADDR = "0x1234567890abcdef1234567890abcdef12345678";
const EVM_ADDR_2 = "0xabcdefABCDEF0000000000000000000000000001";
const TOKEN_ADDR = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC-like
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";
const SOLANA_ADDR = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

describe("isEvmAddress", () => {
	test("returns true for a valid 0x + 40 hex char address", () => {
		expect(isEvmAddress(EVM_ADDR)).toBe(true);
	});

	test("returns true for mixed-case (checksummed) hex", () => {
		expect(isEvmAddress(EVM_ADDR_2)).toBe(true);
	});

	test("returns true for the all-zero address", () => {
		expect(isEvmAddress(ZERO_ADDR)).toBe(true);
	});

	test("returns false for an address that is too short", () => {
		expect(isEvmAddress("0x1234")).toBe(false);
	});

	test("returns false for an address with 39 hex chars", () => {
		expect(isEvmAddress("0x" + "a".repeat(39))).toBe(false);
	});

	test("returns false for an address with 41 hex chars", () => {
		expect(isEvmAddress("0x" + "a".repeat(41))).toBe(false);
	});

	test("returns false when the 0x prefix is missing", () => {
		expect(isEvmAddress("1234567890abcdef1234567890abcdef12345678")).toBe(false);
	});

	test("returns false for non-hex characters in the body", () => {
		// 'g' and 'z' are not valid hex digits
		expect(isEvmAddress("0x" + "g".repeat(40))).toBe(false);
		expect(isEvmAddress("0xZ234567890abcdef1234567890abcdef1234567z")).toBe(
			false,
		);
	});

	test("returns false for a Solana base58 address", () => {
		expect(isEvmAddress(SOLANA_ADDR)).toBe(false);
	});

	test("returns false for an empty string", () => {
		expect(isEvmAddress("")).toBe(false);
	});

	test("returns false when there is leading/trailing whitespace", () => {
		expect(isEvmAddress(` ${EVM_ADDR}`)).toBe(false);
		expect(isEvmAddress(`${EVM_ADDR} `)).toBe(false);
	});

	test("returns false for an uppercase 0X prefix", () => {
		expect(isEvmAddress("0X" + "a".repeat(40))).toBe(false);
	});
});

describe("buildEip681Uri — native asset", () => {
	test("builds a native URI with chainId only (no value)", () => {
		const req: PaymentRequest = { address: EVM_ADDR, chainId: 1 };
		expect(buildEip681Uri(req)).toBe(`ethereum:${EVM_ADDR}@1`);
	});

	test("builds a native URI with no chainId (no @ suffix)", () => {
		const req: PaymentRequest = { address: EVM_ADDR };
		expect(buildEip681Uri(req)).toBe(`ethereum:${EVM_ADDR}`);
	});

	test("includes value (in wei) when amount and decimals are provided", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			amount: "1",
			decimals: 18,
		};
		expect(buildEip681Uri(req)).toBe(
			`ethereum:${EVM_ADDR}@1?value=1000000000000000000`,
		);
	});

	test("includes value with a fractional amount", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 137,
			amount: "1.5",
			decimals: 18,
		};
		expect(buildEip681Uri(req)).toBe(
			`ethereum:${EVM_ADDR}@137?value=1500000000000000000`,
		);
	});

	test("emits value even when chainId is omitted", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			amount: "2",
			decimals: 6,
		};
		expect(buildEip681Uri(req)).toBe(`ethereum:${EVM_ADDR}?value=2000000`);
	});

	test("omits value when amount is present but decimals is undefined", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			amount: "1",
		};
		expect(buildEip681Uri(req)).toBe(`ethereum:${EVM_ADDR}@1`);
	});

	test("omits value when decimals is present but amount is undefined", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			decimals: 18,
		};
		expect(buildEip681Uri(req)).toBe(`ethereum:${EVM_ADDR}@1`);
	});

	test("omits value when amount is an empty string (falsy)", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			amount: "",
			decimals: 18,
		};
		expect(buildEip681Uri(req)).toBe(`ethereum:${EVM_ADDR}@1`);
	});

	test("includes value=0 when decimals is 0 and amount is whole", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			amount: "5",
			decimals: 0,
		};
		expect(buildEip681Uri(req)).toBe(`ethereum:${EVM_ADDR}@1?value=5`);
	});

	test("treats an explicit zero tokenAddress as native (value=... uses ?value)", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			tokenAddress: ZERO_ADDR,
			amount: "1",
			decimals: 18,
		};
		expect(buildEip681Uri(req)).toBe(
			`ethereum:${EVM_ADDR}@1?value=1000000000000000000`,
		);
	});

	test("treats a mixed-case zero tokenAddress as native", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			tokenAddress: "0x0000000000000000000000000000000000000000".toUpperCase(),
		};
		// toLowerCase() of the uppercase zero address still equals ZERO -> native
		expect(buildEip681Uri(req)).toBe(`ethereum:${EVM_ADDR}@1`);
	});
});

describe("buildEip681Uri — ERC-20 transfer", () => {
	test("builds an ERC-20 transfer URI without an amount", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			tokenAddress: TOKEN_ADDR,
		};
		expect(buildEip681Uri(req)).toBe(
			`ethereum:${TOKEN_ADDR}@1/transfer?address=${EVM_ADDR}`,
		);
	});

	test("builds an ERC-20 transfer URI with a uint256 amount", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			tokenAddress: TOKEN_ADDR,
			amount: "1.5",
			decimals: 6,
		};
		expect(buildEip681Uri(req)).toBe(
			`ethereum:${TOKEN_ADDR}@1/transfer?address=${EVM_ADDR}&uint256=1500000`,
		);
	});

	test("builds an ERC-20 transfer URI without a chainId (no @ suffix)", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			tokenAddress: TOKEN_ADDR,
			amount: "2",
			decimals: 6,
		};
		expect(buildEip681Uri(req)).toBe(
			`ethereum:${TOKEN_ADDR}/transfer?address=${EVM_ADDR}&uint256=2000000`,
		);
	});

	test("omits uint256 when amount is present but decimals is undefined", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			tokenAddress: TOKEN_ADDR,
			amount: "1.5",
		};
		expect(buildEip681Uri(req)).toBe(
			`ethereum:${TOKEN_ADDR}@1/transfer?address=${EVM_ADDR}`,
		);
	});

	test("omits uint256 when decimals is present but amount is undefined", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			tokenAddress: TOKEN_ADDR,
			decimals: 6,
		};
		expect(buildEip681Uri(req)).toBe(
			`ethereum:${TOKEN_ADDR}@1/transfer?address=${EVM_ADDR}`,
		);
	});

	test("includes uint256=0 when decimals is 0 and amount is whole", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			tokenAddress: TOKEN_ADDR,
			amount: "7",
			decimals: 0,
		};
		expect(buildEip681Uri(req)).toBe(
			`ethereum:${TOKEN_ADDR}@1/transfer?address=${EVM_ADDR}&uint256=7`,
		);
	});

	test("truncates fractional digits beyond the token's decimals", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			tokenAddress: TOKEN_ADDR,
			amount: "1.123456789",
			decimals: 6,
		};
		expect(buildEip681Uri(req)).toBe(
			`ethereum:${TOKEN_ADDR}@1/transfer?address=${EVM_ADDR}&uint256=1123456`,
		);
	});

	test("throws when the amount is not a valid numeric string", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			tokenAddress: TOKEN_ADDR,
			amount: "abc",
			decimals: 6,
		};
		expect(() => buildEip681Uri(req)).toThrow("invalid amount: abc");
	});

	test("throws when decimals is negative", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			tokenAddress: TOKEN_ADDR,
			amount: "1",
			decimals: -1,
		};
		expect(() => buildEip681Uri(req)).toThrow("invalid decimals: -1");
	});
});

describe("buildPaymentPayload", () => {
	test("returns an EIP-681 URI for an EVM address (default vmType)", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			amount: "1",
			decimals: 18,
		};
		expect(buildPaymentPayload(req)).toBe(
			`ethereum:${EVM_ADDR}@1?value=1000000000000000000`,
		);
	});

	test("returns an EIP-681 URI for an EVM address with explicit vmType 'evm'", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			vmType: "evm",
		};
		expect(buildPaymentPayload(req)).toBe(`ethereum:${EVM_ADDR}@1`);
	});

	test("returns an EIP-681 ERC-20 URI for an EVM address with a token", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			tokenAddress: TOKEN_ADDR,
			amount: "10",
			decimals: 6,
		};
		expect(buildPaymentPayload(req)).toBe(
			`ethereum:${TOKEN_ADDR}@1/transfer?address=${EVM_ADDR}&uint256=10000000`,
		);
	});

	test("returns the bare address for a Solana (svm) address", () => {
		const req: PaymentRequest = {
			address: SOLANA_ADDR,
			vmType: "svm",
		};
		expect(buildPaymentPayload(req)).toBe(SOLANA_ADDR);
	});

	test("returns the bare address for a Solana address even without vmType (not EVM-shaped)", () => {
		const req: PaymentRequest = { address: SOLANA_ADDR };
		expect(buildPaymentPayload(req)).toBe(SOLANA_ADDR);
	});

	test("returns the bare address when address is EVM-shaped but vmType is 'svm'", () => {
		const req: PaymentRequest = {
			address: EVM_ADDR,
			chainId: 1,
			vmType: "svm",
		};
		// EVM-shaped but flagged as svm -> treated as non-EVM, bare address
		expect(buildPaymentPayload(req)).toBe(EVM_ADDR);
	});

	test("returns the bare address for a non-EVM, non-svm vmType value", () => {
		const req: PaymentRequest = {
			address: SOLANA_ADDR,
			vmType: "tvm",
		};
		expect(buildPaymentPayload(req)).toBe(SOLANA_ADDR);
	});

	test("returns the bare address for a malformed (non-EVM) address with default vmType", () => {
		const req: PaymentRequest = { address: "not-an-address" };
		expect(buildPaymentPayload(req)).toBe("not-an-address");
	});
});
